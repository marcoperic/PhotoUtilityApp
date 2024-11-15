import React, { FC, useEffect, useState, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, Image, StyleSheet, View, ViewStyle, ImageStyle, TextStyle, ImageSourcePropType, TouchableOpacity, Animated } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text, Button } from "app/components"
import { colors } from "../theme"
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AntDesign } from '@expo/vector-icons'
import { useStores } from "../models/helpers/useStores"

interface SwipeScreenProps extends AppStackScreenProps<"Swipe"> {}

export const SwipeScreen: FC<SwipeScreenProps> = observer(function SwipeScreen() {
  const { photoStore } = useStores()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [displayPhoto, setDisplayPhoto] = useState<ImageSourcePropType | null>(null)
  const [animation] = useState(new Animated.Value(0))
  const [imageAnimation] = useState(new Animated.Value(1))
  const [overlay, setOverlay] = useState<"keep" | "remove" | null>(null)

  useEffect(() => {
    const loadInitialPhoto = () => {
      if (photoStore.photoURIs.length > 0) {
        setDisplayPhoto({ uri: photoStore.photoURIs[0] })
      }
      setLoading(false)
    }

    loadInitialPhoto()
  }, [photoStore.photoURIs])

  const handleNextPhoto = useCallback(() => {
    const nextIndex = currentIndex + 1
    if (nextIndex < photoStore.photoURIs.length) {
      setCurrentIndex(nextIndex)
      setDisplayPhoto({ uri: photoStore.photoURIs[nextIndex] })
      imageAnimation.setValue(1) // Reset image opacity for the next photo
    } else {
      // Optionally handle end of photos
      setDisplayPhoto(null)
    }
  }, [currentIndex, photoStore.photoURIs.length, imageAnimation])

  const animateOverlay = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setOverlay(null)
        handleNextPhoto()
      })
    })
  }

  // Modified animateImageFadeOut to accept duration
  const animateImageFadeOut = (duration: number) => {
    Animated.timing(imageAnimation, {
      toValue: 0,
      duration: duration, // Use the passed duration
      useNativeDriver: true,
    }).start()
  }

  const handleKeep = useCallback(() => {
    setOverlay("keep")
    animateImageFadeOut(200) // Keep fade-out duration
    animateOverlay()
  }, [animateOverlay])

  const handleRemove = useCallback(() => {
    photoStore.addDeletedPhoto(photoStore.photoURIs[currentIndex])
    setOverlay("remove")
    animateImageFadeOut(200) // Remove fade-out duration faster
    animateOverlay()
  }, [animateOverlay, currentIndex, photoStore])

  if (loading) {
    return (
      <Screen style={$root} preset="scroll">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.palette.neutral500} />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </Screen>
    )
  }

  if (!displayPhoto) {
    return (
      <Screen style={$root} preset="scroll">
        <View style={styles.noPhotosContainer}>
          <Text style={styles.noPhotosText}>No photos available to display.</Text>
        </View>
      </Screen>
    )
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.photoContainer}>
        <View style={styles.card}>
          <Animated.Image
            source={displayPhoto}
            style={[styles.photo, { opacity: imageAnimation }]}
            resizeMode="cover"
          />
          {overlay === "remove" && (
            <Animated.View style={[
              styles.overlay,
              {
                opacity: animation,
                transform: [{
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  })
                }]
              }
            ]}>
              <AntDesign name="closecircle" size={80} color="red" />
            </Animated.View>
          )}
          {overlay === "keep" && (
            <Animated.View style={[
              styles.overlay,
              {
                opacity: animation,
                transform: [{
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  })
                }]
              }
            ]}>
              <AntDesign name="like1" size={80} color="green" />
            </Animated.View>
          )}
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={handleRemove}>
          <Text style={styles.buttonText}>REMOVE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.keepButton]} onPress={handleKeep}>
          <Text style={styles.buttonText}>KEEP</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '95%',
    height: '75%',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    width: '40%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepButton: {
    backgroundColor: 'green',
  },
  removeButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.textDim,
  },
  noPhotosContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noPhotosText: {
    fontSize: 18,
    color: colors.textDim,
  },
  cardStyle: {
    width: '95%',
    height: '75%',
    borderRadius: 15,
    marginVertical: 20,
  },
})

const $root: ViewStyle = {
  flex: 1,
}