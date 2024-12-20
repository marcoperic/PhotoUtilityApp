import React from "react"
import { Modal, View, Image, StyleSheet, TouchableOpacity, ViewStyle, ImageStyle } from "react-native"
import { Text } from "./Text"
import { colors, spacing } from "../theme"
import { MaterialCommunityIcons } from "@expo/vector-icons"

interface ImagePreviewModalProps {
  visible: boolean
  onClose: () => void
  mainImage: string
  similarImages: string[]
  selectedImageIndex: number
  onImageSelect: (index: number) => void
}

export function ImagePreviewModal({
  visible,
  onClose,
  mainImage,
  similarImages,
  selectedImageIndex,
  onImageSelect,
}: ImagePreviewModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={$modalOverlay}>
        <View style={$modalContent}>
          <TouchableOpacity style={$closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Image source={{ uri: selectedImageIndex === -1 ? mainImage : similarImages[selectedImageIndex] }} 
                 style={$mainPreviewImage} 
                 resizeMode="contain" />
          
          <View style={$thumbnailContainer}>
            <TouchableOpacity onPress={() => onImageSelect(-1)}>
              <Image 
                source={{ uri: mainImage }} 
                style={[
                  $thumbnail, 
                  selectedImageIndex === -1 && $selectedThumbnail
                ]} 
              />
            </TouchableOpacity>
            
            {similarImages.map((uri, index) => (
              <TouchableOpacity key={uri} onPress={() => onImageSelect(index)}>
                <Image 
                  source={{ uri }} 
                  style={[
                    $thumbnail, 
                    selectedImageIndex === index && $selectedThumbnail
                  ]} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const $modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  justifyContent: "center",
  alignItems: "center",
}

const $modalContent: ViewStyle = {
  width: "90%",
  height: "80%",
  backgroundColor: colors.background,
  borderRadius: 10,
  padding: spacing.md,
}

const $closeButton: ViewStyle = {
  position: "absolute",
  right: spacing.sm,
  top: spacing.sm,
  zIndex: 1,
}

const $mainPreviewImage: ImageStyle = {
  width: "100%",
  height: "70%",
  marginBottom: spacing.md,
}

const $thumbnailContainer: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: spacing.xs,
}

const $thumbnail: ImageStyle = {
  width: 60,
  height: 60,
  borderRadius: 8,
}

const $selectedThumbnail: ImageStyle = {
  borderWidth: 3,
  borderColor: colors.tint,
} 