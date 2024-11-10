import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, ActivityIndicator, View } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { colors } from "../theme"

interface SwipeScreenProps extends AppStackScreenProps<"Swipe"> {}

export const SwipeScreen: FC<SwipeScreenProps> = observer(function SwipeScreen() {
  const [loading, setLoading] = useState(true)

  return (
    <Screen style={$root} preset="scroll">
      {loading ? (
        <View style={$loadingContainer}>
          <ActivityIndicator size="large" color={colors.palette.neutral500} />
          <Text text="Loading your photos..." style={$loadingText} />
        </View>
      ) : (
        <Text text="Ready to swipe!" />
      )}
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $loadingContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $loadingText: TextStyle = {
  marginTop: 10,
  textAlign: "center",
}
