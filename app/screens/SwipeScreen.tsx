import React, { FC, useEffect, useState, useCallback, useRef } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, Image, StyleSheet, View, ViewStyle, ImageStyle, TextStyle, ImageSourcePropType } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text, Button } from "app/components"
import { colors } from "../theme"
import { Swiper, SwiperCardRefType } from 'rn-swiper-list'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AntDesign } from '@expo/vector-icons'
import PhotoLoader from "../utils/PhotoLoader"

interface SwipeScreenProps extends AppStackScreenProps<"Swipe"> {}

export const SwipeScreen: FC<SwipeScreenProps> = observer(function SwipeScreen() {
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<ImageSourcePropType[]>([])
  const swiperRef = useRef<SwiperCardRefType>(null)
  
  // Ref to store all photo URIs
  const allPhotoURIs = useRef<string[]>([])
  // Ref to keep track of the current index
  const currentIndex = useRef<number>(0)

  const initialLoadCount = 10; // Increased initial load count

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const loadedPhotos = PhotoLoader.getPhotoURIs()
        allPhotoURIs.current = loadedPhotos
        console.log(`Total photos loaded: ${loadedPhotos.length}`)
        if (loadedPhotos.length > 0) {
          const initialPhotos = loadedPhotos.slice(0, initialLoadCount).map(uri => ({ uri }))
          setPhotos(initialPhotos)
          currentIndex.current = initialLoadCount
          console.log(`Initial photos loaded: ${initialPhotos.length}`)
        } else {
          console.warn("No photos loaded.")
        }
      } catch (error) {
        console.error('Error accessing PhotoLoader:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPhotos()
  }, [])

  const renderCard = useCallback(
    (image: ImageSourcePropType, index: number) => (
      <View style={styles.renderCardContainer}>
        <Image
          source={image}
          style={styles.renderCardImage}
          resizeMode="cover"
        />
      </View>
    ),
    []
  );

  const OverlayLabelRight = useCallback(() => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: 'green',
          },
        ]}
      />
    );
  }, []);

  const OverlayLabelLeft = useCallback(() => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: 'red',
          },
        ]}
      />
    );
  }, []);

  const OverlayLabelTop = useCallback(() => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: 'blue',
          },
        ]}
      />
    );
  }, []);

  const handleSwipe = useCallback(() => {
    const photosToLoad = 2; // Number of photos to load each time
    console.log("handleSwipe triggered")
    if (currentIndex.current < allPhotoURIs.current.length) {
      const nextPhotos = allPhotoURIs.current.slice(
        currentIndex.current,
        currentIndex.current + photosToLoad
      ).map(uri => ({ uri }))

      console.log(`Loading photos from index ${currentIndex.current} to ${currentIndex.current + photosToLoad}`)
      setPhotos(prevPhotos => [...prevPhotos, ...nextPhotos])
      currentIndex.current += photosToLoad
      console.log(`Current index updated to ${currentIndex.current}`)
    } else {
      console.log("No more photos to load")
    }
  }, []);

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

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.subContainer}>
        {photos.length > 0 ? (
          <Swiper
            ref={swiperRef}
            cardStyle={styles.cardStyle}
            data={photos}
            renderCard={renderCard}
            onIndexChange={(index) => {
              console.log('Current Active index', index);
              if (index % 2 === 0) {
                handleSwipe()
              }
            }}
            onSwipeRight={(cardIndex) => {
              console.log('Swiped right on cardIndex', cardIndex);
            }}
            onSwipedAll={() => {
              console.log('All cards swiped');
            }}
            onSwipeLeft={(cardIndex) => {
              console.log('Swiped left on cardIndex', cardIndex);
            }}
            onSwipeTop={(cardIndex) => {
              console.log('Swiped top on cardIndex', cardIndex);
            }}
            OverlayLabelRight={OverlayLabelRight}
            OverlayLabelLeft={OverlayLabelLeft}
            OverlayLabelTop={OverlayLabelTop}
            onSwipeActive={() => {
              console.log('Swipe active');
            }}
            onSwipeStart={() => {
              console.log('Swipe started');
            }}
            onSwipeEnd={() => {
              console.log('Swipe ended');
            }}
          />
        ) : (
          <View style={styles.noPhotosContainer}>
            <Text style={styles.noPhotosText}>No photos available to display.</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <Button
          style={styles.button}
          onPress={() => {
            swiperRef.current?.swipeLeft();
          }}
        >
          <AntDesign name="close" size={32} color="white" />
        </Button>
        <Button
          style={[styles.button, { height: 60, marginHorizontal: 10 }]}
          onPress={() => {
            swiperRef.current?.swipeBack();
          }}
        >
          <AntDesign name="reload1" size={24} color="white" />
        </Button>
        <Button
          style={styles.button}
          onPress={() => {
            swiperRef.current?.swipeTop();
          }}
        >
          <AntDesign name="arrowup" size={32} color="white" />
        </Button>
        <Button
          style={styles.button}
          onPress={() => {
            swiperRef.current?.swipeRight();
          }}
        >
          <AntDesign name="heart" size={32} color="white" />
        </Button>
      </View>
    </GestureHandlerRootView>
  )
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    bottom: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 80,
    borderRadius: 40,
    marginHorizontal: 20,
    aspectRatio: 1,
    backgroundColor: '#3A3D45',
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  cardStyle: {
    width: '95%',
    height: '75%',
    borderRadius: 15,
    marginVertical: 20,
  },
  renderCardContainer: {
    flex: 1,
    borderRadius: 15,
    height: '75%',
    width: '100%',
  },
  renderCardImage: {
    height: '100%',
    width: '100%',
    borderRadius: 15,
  },
  overlayLabelContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
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
})

const $root: ViewStyle = {
  flex: 1,
}

