package com.photoutilityapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.provider.MediaStore
import android.content.ContentResolver
import android.content.Intent
import android.net.Uri
import android.content.ContentUris
import android.os.Build
import android.os.Environment
import android.provider.Settings
import android.util.Log
import java.io.File

class ImageDeleteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ImageDeleteModule"
    }

    @ReactMethod
    fun hasPermission(promise: Promise) {
        val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Environment.isExternalStorageManager()
        } else {
            true // Permission not required for older Android versions
        }
        promise.resolve(hasPermission)
    }

    @ReactMethod
    fun requestPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
                    data = Uri.parse("package:${reactApplicationContext.packageName}")
                }
                val activity = reactApplicationContext.currentActivity
                if (activity != null) {
                    activity.startActivity(intent)
                } else {
                    Log.e("ImageDeleteModule", "Current activity is null")
                }
            } catch (e: Exception) {
                Log.e("ImageDeleteModule", "Error starting permission request: ${e.message}")
            }
        } else {
            Log.d("ImageDeleteModule", "Manage All Files permission not required for this OS version")
        }
    }

    private fun getContentUriFromFilePath(filePath: String): Uri? {
        val contentResolver: ContentResolver = reactApplicationContext.contentResolver
        val file = File(filePath)

        val projection = arrayOf(MediaStore.Images.Media._ID)
        val selection = "${MediaStore.Images.Media.DATA}=?"
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
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && !Environment.isExternalStorageManager()) {
                Log.d("ImageDeleteModule", "All files access permission not granted")
                promise.reject("PERMISSION_REQUIRED", "Requires all files access permission")
                return
            }

            val contentResolver: ContentResolver = reactApplicationContext.contentResolver

            // Convert file path to content URI
            val uri = if (imagePath.startsWith("content://")) {
                Uri.parse(imagePath)
            } else {
                val cleanPath = imagePath.removePrefix("file://")
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
