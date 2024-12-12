import * as MediaLibrary from 'expo-media-library';
import ImageProcessor from './ImageProcessor';
import APIClient from './APIClient';
import { delay } from '../utils/delay'

class PhotoLoader {
  private static instance: PhotoLoader;
  private photoURIs: string[];
  private totalPhotos: number;
  private loadedPhotos: number;
  private MAX_IMAGES = 500; // Maximum number of images to load
  private apiClient: APIClient;

  private constructor() {
    this.photoURIs = [];
    this.totalPhotos = 0;
    this.loadedPhotos = 0;
    this.apiClient = new APIClient();
  }

  /**
   * Retrieves the singleton instance of PhotoLoader.
   * @returns {PhotoLoader} The singleton instance.
   */
  static getInstance(): PhotoLoader {
    if (!PhotoLoader.instance) {
      PhotoLoader.instance = new PhotoLoader();
    }
    return PhotoLoader.instance;
  }

  /**
   * Initializes and loads all photos up to MAX_IMAGES.
   * After loading, it preprocesses the images.
   * @param onProgress - Callback to update loading and processing progress.
   */
  async initialize(onProgress?: (progress: number) => void) {
    // Wrap the progress callback to show combined progress
    // Photo loading: 0-50%
    // Preprocessing: 50-85%
    // Server upload: 85-100%
    const wrappedProgress = (progress: number, phase: 'loading' | 'preprocessing' | 'uploading') => {
      if (onProgress) {
        let totalProgress = 0;
        switch (phase) {
          case 'loading':
            totalProgress = progress * 0.2; // 0-20%
            break;
          case 'preprocessing':
            totalProgress = 0.2 + (progress * 0.65); // 20-85%
            break;
          case 'uploading':
            totalProgress = 0.85 + (progress * 0.15); // 85-100%
            break;
        }
        onProgress(totalProgress);
      }
    }

    await this.loadAllPhotos((progress) => wrappedProgress(progress, 'loading'));
    console.log(`Loaded ${this.photoURIs.length} photos. loadAllPhotos function finished.`);
    
    if (this.photoURIs.length > 0) {
      await this.preprocessAndZipImages((progress) => wrappedProgress(progress, 'preprocessing'));
    }
  }

  /**
   * Loads photos with optional progress updates, up to MAX_IMAGES.
   * @param onProgress - Callback to update loading progress.
   */
  private async loadAllPhotos(onProgress?: (progress: number) => void) {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    let hasMorePhotos = true;
    let endCursor: string | undefined = undefined;
    while (
      hasMorePhotos &&
      (this.MAX_IMAGES === -1 || this.loadedPhotos < this.MAX_IMAGES)
    ) {
      const remaining =
        this.MAX_IMAGES === -1 ? 8 : this.MAX_IMAGES - this.loadedPhotos;
      const fetchCount = remaining >= 8 ? 8 : remaining;

      const {
        assets,
        endCursor: newEndCursor,
        hasNextPage,
        totalCount,
      } = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        after: endCursor,
        first: fetchCount,
      });

      this.photoURIs = [...this.photoURIs, ...assets.map(asset => asset.uri)];
      this.loadedPhotos += assets.length;
      this.totalPhotos =
        this.MAX_IMAGES === -1
          ? totalCount
          : Math.min(totalCount, this.MAX_IMAGES);
      console.log(`Loaded ${this.loadedPhotos} photos out of ${this.totalPhotos}`);

      if (onProgress) {
        onProgress(this.getProgress());
      }

      endCursor = newEndCursor;
      hasMorePhotos =
        hasNextPage &&
        (this.MAX_IMAGES === -1 || this.loadedPhotos < this.MAX_IMAGES);
    }

    // Modified log message to handle unlimited case
    if (this.loadedPhotos >= this.MAX_IMAGES && this.MAX_IMAGES !== -1) {
      console.log(`Reached the maximum limit of ${this.MAX_IMAGES} images.`);
    }
  }

  /**
   * Preprocesses images, creates a zip archive, and uploads it to the server.
   * Retries uploading until successful.
   * @param onProgress - Callback to update processing progress.
   */
  async preprocessAndZipImages(onProgress?: (progress: number) => void) {
    try {
      const imageProcessor = ImageProcessor.getInstance();
      const { uri: zipUri, size } = await imageProcessor.createImageZip(
        this.photoURIs,
        (processingProgress) => {
          if (onProgress) {
            const scaledProgress = 0.2 + (processingProgress * 0.65);
            onProgress(scaledProgress);
          }
        }
      );

      // Upload zip - remaining progress
      let uploadSuccessful = false;
      while (!uploadSuccessful) {
        try {
          const response = await this.apiClient.uploadImages(zipUri);
          console.log('Images uploaded successfully:', response);
          uploadSuccessful = true;
          if (onProgress) {
            onProgress(1); // Complete
          }
        } catch (error) {
          console.error('Error during image uploading, retrying in 30 seconds...', error);
          await delay(30000);
        }
      }
    } catch (error) {
      console.error('Error during image preprocessing and uploading:', error);
    }
  }

  /**
   * Gets the loading and processing progress as a value between 0 and 1.
   * @returns Progress value.
   */
  private getProgress(): number {
    if (this.totalPhotos === 0) return 0;
    return this.loadedPhotos / this.totalPhotos;
  }

  /**
   * Returns the loaded photo URIs.
   * @returns Array of photo URIs.
   */
  getPhotoURIs(): string[] {
    return this.photoURIs;
  }

  // Add a new method to calculate total progress including preprocessing
  private getTotalProgress(loadingProgress: number, preprocessingProgress: number): number {
    // Loading photos is 50% of the total progress, preprocessing is the other 50%
    return (loadingProgress * 0.5) + (preprocessingProgress * 0.5);
  }
}

export default PhotoLoader.getInstance();
