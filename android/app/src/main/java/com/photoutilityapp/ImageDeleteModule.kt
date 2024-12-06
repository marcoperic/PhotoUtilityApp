package com.photoutilityapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.provider.MediaStore
import android.content.ContentResolver
import android.net.Uri
import android.content.ContentUris
import android.os.Build
import android.os.Environment
import android.util.Log
import java.io.File

class ImageDeleteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ImageDeleteModule"
    }

    private fun getContentUriFromFilePath(filePath: String): Uri? {
        val contentResolver: ContentResolver = reactApplicationContext.contentResolver
        val file = File(filePath)
        
        val projection = arrayOf(MediaStore.Images.Media._ID)
        val selection = MediaStore.Images.Media.DATA + "=?"
        val selectionArgs = arrayOf(file.absolutePath)
        
        contentResolver.query(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            projection,
            selection,
            selectionArgs,
            null
        )?.use { cursor ->
            if (cursor.moveToFirst()) {
                val id = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID))
                return ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id)
            }
        }
        return null
    }

    @ReactMethod
    fun deleteImage(imagePath: String, promise: Promise) {
        try {
            Log.d("ImageDeleteModule", "Starting delete operation for: $imagePath")
            
            // Check for Android 11+ permission
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                if (!Environment.isExternalStorageManager()) {
                    Log.d("ImageDeleteModule", "All files access permission not granted")
                    throw Exception("Requires all files access permission")
                }
                Log.d("ImageDeleteModule", "All files access permission granted")
            }

            val contentResolver: ContentResolver = reactApplicationContext.contentResolver
            
            // Convert file path to content URI
            val uri = if (imagePath.startsWith("content://")) {
                Uri.parse(imagePath)
            } else {
                // Remove "file://" if present
                val cleanPath = imagePath.replace("file://", "")
                getContentUriFromFilePath(cleanPath) 
                    ?: throw Exception("Could not find image in MediaStore")
            }
            
            Log.d("ImageDeleteModule", "Attempting to delete with URI: $uri")
            
            val rowsDeleted = contentResolver.delete(uri, null, null)
            Log.d("ImageDeleteModule", "Delete operation result: $rowsDeleted rows deleted")
            
            if (rowsDeleted > 0) {
                promise.resolve("Image deleted successfully")
            } else {
                promise.reject("DELETE_FAILED", "Failed to delete image")
            }
        } catch (e: Exception) {
            Log.e("ImageDeleteModule", "Error during deletion: ${e.message}")
            promise.reject("DELETE_ERROR", e.message)
        }
    }
}