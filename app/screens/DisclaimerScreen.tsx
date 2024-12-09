import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TextStyle, View, Alert } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text, Button } from "app/components"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import PhotoLoader from "app/utils/PhotoLoader"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { checkPermission } from "app/utils/ImageDeleteService"

interface DisclaimerScreenProps extends AppStackScreenProps<"Disclaimer"> {}

export const DisclaimerScreen: FC<DisclaimerScreenProps> = observer(function DisclaimerScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const {
    authenticationStore: { generateUniqueId, setDisclaimerAccepted },
  } = useStores()

  const {
    photoStore,
  } = useStores()

  useEffect(() => {
    generateUniqueId()
  }, [])

  const handlePhotoLoading = async () => {
    setLoading(true)
    try {
      // setDisclaimerAccepted()

      checkPermission()
      
      await PhotoLoader.initialize((progressValue) => {
        console.log("Progress:", progressValue)
        setProgress(progressValue)
      })
      
      // Store the loaded URIs in PhotoStore
      photoStore.setPhotoURIs(PhotoLoader.getPhotoURIs())
      
      // Navigate after photos are loaded
      navigation.navigate("Swipe" as never)
    } catch (error) {
      console.error('Failed to initialize PhotoLoader:', error)
      Alert.alert(
        "Error",
        "Failed to load photos. Please check your permissions and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen style={$root} preset="scroll">
      <View style={$container}>
        {/* Icon Section */}
        <View style={$iconContainer}>
          <MaterialCommunityIcons name="shield-lock" size={100} color="#4CAF50" />
        </View>

        {/* Title Section */}
        <Text style={$title} text="Data Privacy Notice" />

        {/* Content Section */}
        <View style={$contentContainer}>
          <Text style={$paragraph} text="We value your privacy and want to be transparent about how we handle your data:" />
          
          <Text style={$bulletPoint} text="• We do not save your data on our servers" />
          <Text style={$bulletPoint} text="• On the first launch, your device processes your photos and sends some anonymous data to our server" />
          <Text style={$bulletPoint} text="• We use this data to give you accurate recommendations for photo deletion" />
          <Text style={$bulletPoint} text="• We never share your personal information with third parties" />
          
          <Text style={$paragraph} text="By continuing to use this app, you agree to our data handling practices as described in our Privacy Policy." />
        </View>

        {/* Button Section */}
        <View style={$buttonContainer}>
          <Button
            text="Sounds Good!"
            style={[$button, loading && $buttonDisabled]}
            textStyle={$buttonText}
            pressedStyle={$buttonPressed}
            onPress={handlePhotoLoading}
            disabled={loading}
          />
        </View>
      </View>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: "#fff",
}

const $container: ViewStyle = {
  flex: 1,
  padding: 20,
}

const $iconContainer: ViewStyle = {
  alignItems: "center",
  marginTop: 40,
  marginBottom: 20,
}

const $title: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 20,
}

const $contentContainer: ViewStyle = {
  flex: 1,
  marginVertical: 20,
}

const $paragraph: TextStyle = {
  fontSize: 16,
  lineHeight: 24,
  marginBottom: 20,
}

const $bulletPoint: TextStyle = {
  fontSize: 16,
  lineHeight: 24,
  marginBottom: 10,
  paddingLeft: 10,
}

const $buttonContainer: ViewStyle = {
  paddingVertical: 20,
}

const $button: ViewStyle = {
  backgroundColor: "#4CAF50",
  borderRadius: 8,
  paddingVertical: 12,
}

const $buttonText: TextStyle = {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
}

const $buttonPressed: ViewStyle = {
  backgroundColor: "#388E3C",
}

const $buttonDisabled: ViewStyle = {
  opacity: 0.7,
}
