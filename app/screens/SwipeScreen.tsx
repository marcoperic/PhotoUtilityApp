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

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const loadedPhotos = PhotoLoader.getPhotoURIs()
        if (loadedPhotos.length > 0) {
          setPhotos(loadedPhotos.map(uri => ({ uri })))
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
    (image: ImageSourcePropType) => {
      return (
        <View style={styles.renderCardContainer}>
          <Image
            source={image}
            style={styles.renderCardImage}
            resizeMode="cover"
          />
        </View>
      );
    },
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

