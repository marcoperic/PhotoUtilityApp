import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, Image, StyleSheet, View, ViewStyle, TouchableOpacity, ImageStyle } from "react-native"
import { Screen, Text, Button } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { AppStackScreenProps } from "app/navigators"
import { ImagePreviewModal } from "app/components/ImagePreviewModal"
import { MaterialCommunityIcons } from "@expo/vector-icons"

interface TrashScreenProps extends AppStackScreenProps<"Trash"> {}

export const TrashScreen: FC<TrashScreenProps> = observer(function TrashScreen() {
  const { photoStore } = useStores()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<{ uri: string; similarImages: string[] }>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1)

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
    try {
      // Here you would typically show a confirmation dialog
      // TODO: implement deletion
      photoStore.deleteAllSelected()
    } catch (error) {
      console.error('Error deleting photos:', error)
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
          
          {/* Similar Images Preview Circles */}
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
          <Button
            text={`Delete All (${photoStore.selectedCount})`}
            style={styles.deleteButton}
            preset="reversed"
            onPress={handleDeleteAll}
          />
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
  } as ViewStyle,
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  } as ViewStyle,

  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
  } as ViewStyle,

  listContentContainer: {
    padding: spacing.xs,
  } as ViewStyle,

  photoCard: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: colors.palette.neutral200,
    borderRadius: 12,
    overflow: "hidden",
  } as ViewStyle,

  mainImage: {
    width: "100%",
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  } as ImageStyle,

  previewCirclesContainer: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,

  previewCircleButton: {
    marginLeft: -spacing.xs, // Overlap circles slightly
  } as ViewStyle,

  previewCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.background,
  } as ImageStyle,

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
  } as ViewStyle,

  additionalCountText: {
    color: colors.palette.neutral100,
  } as ViewStyle,

  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xs,
  } as ViewStyle,

  similarText: {
    color: colors.textDim,
  } as ViewStyle,

  checkbox: {
    padding: spacing.xs,
  } as ViewStyle,

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  emptyText: {
    color: colors.textDim,
    marginTop: spacing.sm,
  } as ViewStyle,
})
