import * as MediaLibrary from 'expo-media-library';
import ImageProcessor from './ImageProcessor';

class PhotoLoader {
  private static instance: PhotoLoader;
  private photoURIs: string[];
  private totalPhotos: number;
  private loadedPhotos: number;
  private MAX_IMAGES = 200; // Maximum number of images to load

  private constructor() {
    this.photoURIs = [];
    this.totalPhotos = 0;
    this.loadedPhotos = 0;
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
    await this.loadAllPhotos(onProgress);
    console.log(`Loaded ${this.photoURIs.length} photos. loadAllPhotos function finished.`);
    if (this.photoURIs.length > 0) {
      await this.preprocessAndZipImages(onProgress);
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
   * Preprocesses images and creates a zip archive.
   * @param onProgress - Callback to update processing progress.
   */
  private async preprocessAndZipImages(onProgress?: (progress: number) => void) {
    try {
      const { uri: zipUri, size } = await ImageProcessor.createImageZip(this.photoURIs);
      console.log(`Zip created at ${zipUri} with size ${size} bytes`);

      // You can now upload the zipUri to your server or handle it as needed.
      // For example:
      // await uploadZipToServer(zipUri);

      if (onProgress) {
        onProgress(1); // Processing complete
      }
    } catch (error) {
      console.error('Error during image preprocessing and zipping:', error);
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
}

export default PhotoLoader.getInstance();
