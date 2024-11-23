import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, Image, ImageStyle, ScrollView, StyleSheet, View, ViewStyle } from "react-native"
import { Screen, Text } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { AppStackScreenProps } from "app/navigators"

interface TrashScreenProps extends AppStackScreenProps<"Trash"> {}

export const TrashScreen: FC<TrashScreenProps> = observer(function TrashScreen() {
  const { photoStore } = useStores()

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.rowContainer}>
      <Image source={{ uri: item }} style={styles.mainImage} />
      <View style={styles.contentContainer}>
        <Text 
          text={`${4} similar images found`} 
          size="xs" 
          style={styles.similarText}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.similarImagesContainer}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Image 
              key={index} 
              source={{ uri: item }} 
              style={styles.similarImage} 
            />
          ))}
        </ScrollView>
      </View>
    </View>
  )

  return (
    <Screen style={styles.root} preset="scroll">
      {photoStore.deletedPhotoURIs.length === 0 ? (
        <Text text="No items in Trash." />
      ) : (
        <FlatList
          data={photoStore.deletedPhotoURIs.slice()}
          keyExtractor={(uri) => uri}
          renderItem={renderItem}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </Screen>
  )
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  } as ViewStyle,
  listContentContainer: {
    paddingBottom: spacing.lg,
  } as ViewStyle,
  rowContainer: {
    flexDirection: "row",
    marginBottom: spacing.md,
    backgroundColor: colors.palette.neutral200,
    borderRadius: 10,
    padding: spacing.xs,
  } as ViewStyle,
  mainImage: {
    width: 104,
    height: 104,
    borderRadius: 8,
  } as ImageStyle,
  contentContainer: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: "center",
  } as ViewStyle,
  similarText: {
    color: colors.textDim,
    marginBottom: spacing.xs,
  } as ViewStyle,
  similarImagesContainer: {
    flexGrow: 0,
  } as ViewStyle,
  similarImage: {
    width: 64,
    height: 64,
    borderRadius: 6,
    marginRight: spacing.xs,
  } as ImageStyle,
})
