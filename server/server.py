from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Dict, List
import shutil
import zipfile
import os
from pathlib import Path

os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'

import tempfile
import uuid
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import faiss
import secrets
import time
import json
import matplotlib.pyplot as plt
from concurrent.futures import ThreadPoolExecutor
from threading import Lock
import threading

app = FastAPI()

# Load the ResNet model (moved outside of function for efficiency)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = models.resnet101(pretrained=True)
model = torch.nn.Sequential(*list(model.children())[:-1])
model.to(device)
model.eval()

# Define transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def extract_features(image):
    image = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        features = model(image)
        features = features.squeeze()  # Keep dimensions
    return features.cpu().numpy()  # Move to CPU and convert to numpy at the end

# In-memory storage for uploaded images
image_storage: Dict[str, Dict[str, bytes]] = {}

# Create a thread-local storage for indices
class IndexManager:
    def __init__(self):
        self.indices = {}
        self.locks = {}
        self._lock = Lock()  # Lock for managing the dictionary itself

    def get_index(self, user_id: str):
        with self._lock:
            if user_id not in self.locks:
                self.locks[user_id] = Lock()
            
        with self.locks[user_id]:
            if user_id not in self.indices:
                # Load index from disk if it exists
                user_dir = get_user_dir(user_id)
                index_path = user_dir / "faiss.index"
                paths_file = user_dir / "image_paths.json"
                
                if index_path.exists() and paths_file.exists():
                    index = faiss.read_index(str(index_path))
                    with open(paths_file, 'r') as f:
                        paths = json.load(f)
                    self.indices[user_id] = {
                        'index': index,
                        'paths': paths
                    }
                else:
                    return None, None
            
            return (self.indices[user_id]['index'], 
                   self.indices[user_id]['paths'])

    def set_index(self, user_id: str, index, paths):
        with self._lock:
            if user_id not in self.locks:
                self.locks[user_id] = Lock()
                
        with self.locks[user_id]:
            self.indices[user_id] = {
                'index': index,
                'paths': paths
            }

# Create a global index manager
index_manager = IndexManager()

# User data directory
USER_DATA_DIR = "user_data"

def get_user_dir(user_id: str) -> Path:
    user_dir = Path(USER_DATA_DIR) / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir

@app.get("/check_index/{user_id}")
async def check_index(user_id: str):
    user_dir = get_user_dir(user_id)
    index_path = user_dir / "faiss.index"
    paths_file = user_dir / "image_paths.json"
    
    if index_path.exists() and paths_file.exists():
        # Load the existing index and paths
        faiss_index, image_paths = index_manager.get_index(user_id)
        print("Loaded index belonging to user:", user_id)
        return {"exists": True, "image_count": len(image_paths)}
    
    print("No index found for user:", user_id)
    return {"exists": False}

@app.post("/imgUpload")
async def upload_images(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        user_dir = get_user_dir(user_id)
        
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_path = os.path.join(temp_dir, file.filename)
            
            # Save uploaded file temporarily
            with open(zip_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Process zip file
            image_paths = []  # Will store original Android URIs
            features_list = []
            manifest = {}
            
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                # First, read the manifest to get original URIs
                if 'manifest.json' in zip_ref.namelist():
                    with zip_ref.open('manifest.json') as manifest_file:
                        manifest = json.load(manifest_file)
                else:
                    return JSONResponse(
                        status_code=400,
                        content={"message": "No manifest.json found in zip file"}
                    )
                
                files = [f for f in zip_ref.namelist() if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
                total_files = len(files)
                print(f"\nFound {total_files} images to process")
                
                zip_ref.extractall(temp_dir)
                
                # Process each image
                for idx, filename in enumerate(files, 1):
                    if filename == 'manifest.json':
                        continue
                        
                    image_path = os.path.join(temp_dir, filename)
                    try:
                        print(f"Processing image {idx}/{total_files}: {filename}")
                        
                        # Process image and extract features
                        image = Image.open(image_path).convert('RGB')
                        features = extract_features(image)
                        
                        # Get the original Android URI from manifest
                        original_uri = manifest.get(filename)
                        if original_uri:
                            image_paths.append(original_uri)
                            features_list.append(features)
                            print(f"✓ Extracted features for image {idx}/{total_files}")
                        
                    except Exception as e:
                        print(f"✗ Error processing image {idx}/{total_files}: {str(e)}")
                        continue
            
            if not features_list:
                return JSONResponse(
                    status_code=400,
                    content={"message": "No valid images found in zip file"}
                )
            
            # Convert features list to numpy array
            features_array = np.array(features_list).astype('float32')
            
            # Create and train FAISS index
            dimension = features_array.shape[1]
            faiss_index = create_faiss_index(dimension, features_array)
            
            # Save only the index and original URIs
            index_path = user_dir / "faiss.index"
            paths_file = user_dir / "image_paths.json"
            
            faiss.write_index(faiss_index, str(index_path))
            with open(paths_file, 'w') as f:
                json.dump(image_paths, f)
            
            # Store in memory
            index_manager.set_index(user_id, faiss_index, image_paths)
            
            return {"message": f"Successfully processed {len(image_paths)} images"}
            
    except Exception as e:
        print(f"Error during upload: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred during upload: {str(e)}"}
        )

@app.post("/search")
async def search_similar_images(file: UploadFile = File(...), k: int = 5, user_id: str = Form(...)):
    try:
        # Get the index for this user
        faiss_index, image_paths = index_manager.get_index(user_id)
        
        if faiss_index is None:
            return JSONResponse(
                status_code=500,
                content={"message": "No index found. Please upload images first."}
            )

        with tempfile.TemporaryDirectory() as temp_dir:
            image_path = os.path.join(temp_dir, file.filename)
            with open(image_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            image = Image.open(image_path).convert('RGB')
            features = extract_features(image)
            
            query_vector = np.array(features).astype('float32').reshape(1, -1)
            k_search = min(k * 2, len(image_paths))
            
            # Use a lock when searching the index
            with index_manager.locks[user_id]:
                distances, indices = faiss_index.search(query_vector, k_search)
            
            max_dist = np.max(distances)
            if max_dist > 0:
                distances = distances / max_dist
            
            threshold = 0.8
            valid_indices = distances[0] < threshold
            
            similar_uris = [image_paths[idx] for idx in indices[0][valid_indices]]
            distances = distances[0][valid_indices].tolist()
            print(f"Found {len(similar_uris)} similar images")
            print(f"Similar images: {similar_uris}")

            return {
                "similar_images": similar_uris[:k], 
                "distances": distances[:k],
                "similarity_scores": [(1 - d) * 100 for d in distances[:k]]
            }
            
    except Exception as e:
        print(f"Error during search: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred during search: {str(e)}"}
        )

@app.get("/")
async def root():
    return {"message": "Image Upload Server is running"}

def create_faiss_index(dimension, features):
    nlist = 125  # number of clusters
    quantizer = faiss.IndexFlatL2(dimension)
    index = faiss.IndexIVFFlat(quantizer, dimension, nlist, faiss.METRIC_L2)
    index.train(features)  # Train on the data
    index.add(features)
    return index

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)