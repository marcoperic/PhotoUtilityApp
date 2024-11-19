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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarImagesContainer}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Image key={index} source={{ uri: item }} style={styles.similarImage} />
        ))}
      </ScrollView>
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
    alignItems: "center",
    marginBottom: spacing.md,
  } as ViewStyle,
  mainImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: spacing.sm,
  } as ImageStyle,
  similarImagesContainer: {
    flex: 1,
  } as ViewStyle,
  similarImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: spacing.xs,
  } as ImageStyle,
})
