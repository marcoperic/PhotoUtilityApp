import * as FileSystem from 'expo-file-system';
import { useStores } from '../models';

class APIClient {
  private static instance: APIClient;
  public baseUrl: string;
  private _userId: string | null;

  private constructor() {
    this.baseUrl = 'http://172.16.116.18:8000';
    this._userId = null;
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  public setUserId(id: string) {
    if (!id) {
      throw new Error('User ID cannot be null or undefined');
    }
    this._userId = id;
  }

  public getUserId(): string {
    if (!this._userId) {
      throw new Error('User ID not set. Please call setUserId first.');
    }
    return this._userId;
  }

  async checkExistingIndex(): Promise<{ exists: boolean; imageCount?: number }> {
    try {
      const userId = this.getUserId();
      const response = await fetch(`${this.baseUrl}/check_index/${userId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking index:', error);
      return { exists: false };
    }
  }

  async uploadImages(zipUri: string): Promise<Response> {
    const formData = new FormData();
    formData.append('file', {
      uri: zipUri,
      name: 'images.zip',
      type: 'application/zip'
    } as any);
    formData.append('user_id', this.getUserId());

    try {
      const response = await fetch(`${this.baseUrl}/imgUpload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  async searchSimilarImages(
    imageUri: string,
    k: number = 5
  ): Promise<{ similar_images: string[]; distances: number[] }> {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'query.jpg',
      type: 'image/jpeg'
    } as any);
    formData.append('k', k.toString());
    formData.append('user_id', this.getUserId());

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error searching similar images:', error);
      throw error;
    }
  }
}

export default APIClient;