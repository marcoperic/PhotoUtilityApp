import { NativeModules, Platform, PermissionsAndroid, Linking } from 'react-native';

interface ImageDeleteModuleInterface {
  deleteImage(uri: string): Promise<string>;
  hasPermission(): Promise<boolean>;
  requestPermission(): void;
}

const { ImageDeleteModule } = NativeModules;

const requestManageExternalStoragePermission = async () => {
  if (Platform.Version >= 30) {
    // Check if we already have permission
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE
    );

    if (!hasPermission) {
      // Open the specific settings page for MANAGE_ALL_FILES_ACCESS_PERMISSION
      await Linking.openSettings();
      // We throw here because we need the user to grant permission and try again
      throw new Error('Please grant "All files access" permission from Settings and try again');
    }
  }
};

export const deleteImage = async (uri: string): Promise<string> => {
  if (Platform.OS !== 'android') {
    throw new Error('This feature is only available on Android');
  }

  try {
    // Request permissions first
    // await requestManageExternalStoragePermission();
    // console.log('permissions module passed')

    if (!ImageDeleteModule) {
      throw new Error('ImageDeleteModule is not available');
    }

    const result = await ImageDeleteModule.deleteImage(uri);
    return result;
  } catch (error: any) {
    // Check if the error message indicates the image was not found
    if (error.message.includes("DELETE_FAILED")) {
      // Optionally, resolve with a specific message or handle silently
      console.warn(`Image at URI ${uri} was not found or already deleted.`)
      return "Image already deleted or not found"
    }
    throw error;
  }
};

// Check permission
export async function checkPermission() {
  const hasPermission = await ImageDeleteModule.hasPermission();
  if (!hasPermission) {
    requestPermission();
  }
}

// Request permission
export function requestPermission() {
  ImageDeleteModule.requestPermission();
}

export default {
  deleteImage,
};