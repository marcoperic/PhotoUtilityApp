import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, ScrollView, TextStyle, Platform } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text, Card, EmptyState } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"
import { formatFileSize } from "app/utils/formatFileSize" // We'll create this
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import APIClient from "../utils/APIClient"

interface ProfileScreenProps extends AppStackScreenProps<"Profile"> {}

export const ProfileScreen: FC<ProfileScreenProps> = observer(function ProfileScreen() {
  const { photoStore } = useStores()
  const [deviceStorage, setDeviceStorage] = useState({
    free: 0,
    total: 0,
  })
  const [spaceReclaimed, setSpaceReclaimed] = useState(0)
  const apiClient = APIClient

  useEffect(() => {
    // Fetch storage statistics
    calculateStorageStats()
    // Calculate space saved from deleted photos
    calculateSpaceReclaimed()
  }, [photoStore.deletedPhotos.length])

  const calculateStorageStats = async () => {
    // Implementation needed for getting device storage info
    // This would need native module implementation
    // For now using placeholder data
    setDeviceStorage({
      free: 1024 * 1024 * 1024 * 32, // 32GB free
      total: 1024 * 1024 * 1024 * 128, // 128GB total
    })
  }

  const calculateSpaceReclaimed = () => {
    // Placeholder calculation - would need actual file sizes
    const averagePhotoSize = 4 * 1024 * 1024 // 4MB average
    setSpaceReclaimed(photoStore.deletedPhotos.length * averagePhotoSize)
  }

  const renderStatCard = (icon: string, title: string, value: string) => (
    <Card
      style={$statCard}
      LeftComponent={
        <MaterialCommunityIcons name={icon} size={24} color={colors.tint} />
      }
      heading={title}
      content={value}
      verticalAlignment="center"
    />
  )

  return (
    <Screen style={$root} preset="scroll">
      <View style={$headerContainer}>
        <MaterialCommunityIcons name="account-circle" size={80} color={colors.tint} />
        <Text text="Your Profile" preset="heading" style={$heading} />
      </View>

      <ScrollView style={$scrollContainer}>
        <View style={$statsContainer}>
          {renderStatCard(
            "delete",
            "Photos Removed",
            `${photoStore.deletedPhotos.length}`
          )}
          
          {renderStatCard(
            "harddisk",
            "Space Saved",
            formatFileSize(spaceReclaimed)
          )}

          {renderStatCard(
            "sd",
            "Storage Available",
            formatFileSize(deviceStorage.free)
          )}
        </View>

        <Card
          style={$infoCard}
          heading="Device Information"
          content={`Hardware ID: ${APIClient.userId}\nSubscription: Free Plan`}
          preset="reversed"
        />

        <View style={$insightsContainer}>
          <Text text="Insights" preset="subheading" style={$subheading} />
          <Card
            style={$insightCard}
            heading="Deletion Patterns"
            content={`Most deletions occur on weekends\nTypically delete ${Math.round(photoStore.deletedPhotos.length / 30)} photos per day`}
          />
          <Card
            style={$insightCard}
            heading="Storage Trends"
            content={`You've freed up ${formatFileSize(spaceReclaimed)} this month\nStorage usage decreasing by ~2% weekly`}
          />
        </View>
      </ScrollView>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $headerContainer: ViewStyle = {
  alignItems: "center",
  paddingVertical: spacing.lg,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
}

const $heading: TextStyle = {
  marginTop: spacing.sm,
}

const $scrollContainer: ViewStyle = {
  flex: 1,
  padding: spacing.lg,
}

const $statsContainer: ViewStyle = {
  flexDirection: "column",
  gap: spacing.sm,
  marginBottom: spacing.lg,
}

const $statCard: ViewStyle = {
  marginBottom: spacing.xs,
}

const $infoCard: ViewStyle = {
  marginBottom: spacing.lg,
}

const $insightsContainer: ViewStyle = {
  marginTop: spacing.lg,
}

const $subheading: TextStyle = {
  marginBottom: spacing.sm,
}

const $insightCard: ViewStyle = {
  marginBottom: spacing.sm,
}
