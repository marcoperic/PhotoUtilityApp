import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, Image, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { Screen, Text, Button } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { AppStackScreenProps } from "app/navigators"
import { ImagePreviewModal } from "app/components/ImagePreviewModal"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import ImageDeleteService from "app/utils/ImageDeleteService"

interface TrashScreenProps extends AppStackScreenProps<"Trash"> {}

export const TrashScreen: FC<TrashScreenProps> = observer(function TrashScreen() {
  const { photoStore } = useStores()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<{ uri: string; similarImages: string[] }>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1)
  const [isDeleting, setIsDeleting] = useState(false)

  const handlePhotoPress = (photo: { uri: string; similarImages: string[] }) => {
    setSelectedPhoto(photo)
    setSelectedImageIndex(-1)
    setModalVisible(true)
  }

  const handleSimilarImagePress = (photo: { uri: string; similarImages: string[] }, index: number) => {
    setSelectedPhoto(photo)
    setSelectedImageIndex(index)
    setModalVisible(true)
  }

  const handleDeleteAll = async () => {
    const photosToDelete = photoStore.deletedPhotos.filter(photo => photo.isSelected)

    if (photosToDelete.length === 0) {
      Alert.alert("No Selection", "Please select at least one photo to delete.")
      return
    }

    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${photosToDelete.length} photos and their similar images?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => performDeletion(photosToDelete) }
      ]
    )
  }

  const performDeletion = async (photos: typeof photoStore.deletedPhotos) => {
    setIsDeleting(true)

    try {
      // Gather all URIs to delete, including similar images
      const allUris = photos.reduce((acc, photo) => {
        acc.push(photo.uri, ...photo.similarImages)
        return acc
      }, [] as string[])

      // Deduplicate URIs
      const uniqueUris = Array.from(new Set(allUris))

      // Delete each URI
      for (const uri of uniqueUris) {
        try {
          await ImageDeleteService.deleteImage(uri)
          console.log(`Deleted image: ${uri}`)
        } catch (error) {
          console.error(`Error deleting image ${uri}:`, error)
        }
      }

      // After successful deletion, update the store
      photoStore.deleteAllSelected()

      Alert.alert("Success", "Selected photos and their similar images have been deleted.")
    } catch (error) {
      console.error("Error during deletion:", error)
      Alert.alert("Error", "An unexpected error occurred during deletion.")
    } finally {
      setIsDeleting(false)
    }
  }

  const renderItem = ({ item }: { item: { uri: string; similarImages: string[]; isSelected: boolean } }) => {
    // Filter out duplicates and the main image from similar images
    const filteredSimilarImages = [...new Set(item.similarImages)].filter(uri => uri !== item.uri)
    const maxPreviewImages = 3 // Number of preview circles to show
    
    return (
      <View style={styles.photoCard}>
        <TouchableOpacity onPress={() => handlePhotoPress(item)}>
          <Image source={{ uri: item.uri }} style={styles.mainImage} />
          
          {filteredSimilarImages.length > 0 && (
            <View style={styles.previewCirclesContainer}>
              {filteredSimilarImages.slice(0, maxPreviewImages).map((similarUri, index) => (
                <TouchableOpacity
                  key={similarUri}
                  style={styles.previewCircleButton}
                  onPress={() => handleSimilarImagePress(item, index)}
                >
                  <Image source={{ uri: similarUri }} style={styles.previewCircle} />
                </TouchableOpacity>
              ))}
              
              {/* Additional count indicator */}
              {filteredSimilarImages.length > maxPreviewImages && (
                <View style={styles.additionalCountContainer}>
                  <Text 
                    text={`+${filteredSimilarImages.length - maxPreviewImages}`}
                    size="xs"
                    style={styles.additionalCountText}
                  />
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Similar Images Count */}
        <View style={styles.infoContainer}>
          <Text 
            text={`${filteredSimilarImages.length} similar images`}
            size="sm"
            style={styles.similarText}
          />
          
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => photoStore.togglePhotoSelection(item.uri)}
          >
            <MaterialCommunityIcons
              name={item.isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
              size={24}
              color={colors.tint}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <Screen style={styles.root} preset="fixed">
      {/* Header with Delete All button */}
      <View style={styles.header}>
        <Text text="Trash" preset="heading" />
        {photoStore.selectedCount > 0 && (
          <>
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Button
                text={`Delete All (${photoStore.selectedCount})`}
                style={styles.deleteButton}
                preset="reversed"
                onPress={handleDeleteAll}
              />
            )}
          </>
        )}
      </View>

      {photoStore.sortedDeletedPhotos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="delete-empty" size={64} color={colors.textDim} />
          <Text text="No items in Trash" style={styles.emptyText} />
        </View>
      ) : (
        <FlatList
          data={photoStore.sortedDeletedPhotos}
          keyExtractor={(item) => item.uri}
          renderItem={renderItem}
          contentContainerStyle={styles.listContentContainer}
          numColumns={2}
        />
      )}

      {/* Preview Modal */}
      {selectedPhoto && (
        <ImagePreviewModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          mainImage={selectedPhoto.uri}
          similarImages={selectedPhoto.similarImages}
          selectedImageIndex={selectedImageIndex}
          onImageSelect={setSelectedImageIndex}
        />
      )}
    </Screen>
  )
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.palette.neutral300,
  },
  
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
  },
  
  listContentContainer: {
    padding: spacing.xs,
    paddingBottom: spacing.xxl * 2,
  },

  photoCard: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: colors.palette.neutral200,
    borderRadius: 12,
    overflow: "hidden",
  },
  
  mainImage: {
    width: "100%",
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  
  previewCirclesContainer: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  
  previewCircleButton: {
    marginLeft: -spacing.xs, // Overlap circles slightly
  },
  
  previewCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.background,
  },
  
  additionalCountContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.palette.neutral800,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -spacing.xs,
    borderWidth: 2,
    borderColor: colors.background,
  },
  
  additionalCountText: {
    color: colors.palette.neutral100,
  },
  
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xs,
  },
  
  similarText: {
    color: colors.textDim,
  },
  
  checkbox: {
    padding: spacing.xs,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  emptyText: {
    color: colors.textDim,
    marginTop: spacing.sm,
  },
})
