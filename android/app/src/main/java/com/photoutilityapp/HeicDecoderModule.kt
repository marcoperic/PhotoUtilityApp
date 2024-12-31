package com.photoutilityapp

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File
import java.io.FileInputStream
import java.util.Base64
import java.io.ByteArrayOutputStream

class HeicDecoderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "HeicDecoder"
    }

    @ReactMethod
    fun decodeHeic(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FileNotFound", "The file does not exist: $filePath")
                return
            }

            val inputStream = FileInputStream(file)
            val bitmap: Bitmap = BitmapFactory.decodeStream(inputStream)
            inputStream.close()

            val outputStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.JPEG, 95, outputStream)
            val byteArray = outputStream.toByteArray()
            outputStream.close()

            val base64String = Base64.getEncoder().encodeToString(byteArray)
            promise.resolve(base64String)
        } catch (e: Exception) {
            promise.reject("DecodingError", e.message)
        }
    }
}