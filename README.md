# CHANGES FOR THIS BRANCH
- ~~When the user clicks delete, the network operations should occur asynchronously. Currently, the app flow gets held up by it.~~
- ~~The photo loading needs to happen after the user clicks the disclaimer. The UI should be usable during this process.~~
- ~~The progress bar / header needs to be updatable [handled in another future UI branch]~~
- ~~Create the profile screen~~
- Implement left-right swipe on the swipescreen
- ~~Need to make the HWID generation robust~~
- ~~User cannot navigate backwards to the disclaimer screen~~
- ~~Encountered two children with the same key. Keys should be unique so that components maintain their identity across updates (ERROR)~~
    - ~~This error happens because the server returns a similar image that is the same as the one the user is trying to delete.~~
- ~~APIClient is not singleton~~
- Need to test server performance with multiple devices simultaneously making requests
- ~~Thread-safe server implementation~~
- ~~Server needs to delete temp files~~
- ~~Server should not return duplicate similar images~~
- ~~Server should only take URI as input for search, not entire image~~
- ~~Tweak preprocessing step on mobile (512x512 instead of 224x224, 0.8 compression)~~
  - 224p, 0.9: 33.29 seconds
  - no resize, 0.9: FAIL
  - 92p, 0.9: 29.42 seconds
  - 224p, no compress: 35 seconds
  - 512p, 0.9: 42s
- ~~User ID not set after reloading app (BUG)~~
- Handle case when user does not grant permissions
- out of memory error when zip file gets too large or too many photos?
  -  ERROR  Error during image preprocessing and uploading: [Error: Call to function 'ExponentFileSystem.writeAsStringAsync' has been rejected.
→   Caused by: java.lang.OutOfMemoryError: Failed to allocate a 48477640 byte allocation with 11328096 free bytes and 10MB until OOM, target footprint 201326592, growth limit 201326592]

# Design Notes

When the user swipes to delete an image, the URI is passed to the server and it returns the number of images that are within a certain distance. The original picture is added to the delete page and the neighbor images are also added. The number is displayed as a little pop-up, like a game point number.

The trash screen needs to have a feature that allows users to delete. There also needs to be a modal so that users can closely inspect the images that are going to be deleted.

Track statistics on the profile screen

Need to get a color palette and begin a branch for UI refinement

## IAP

IAP monetization - referrals for content creators?

Limit for non-premium users to 10 swipes per day.

Premium users get unlimited swipes and can also select the threshold for how similar images need to be to be deleted.

On the trash screen, show the number of similar images that are going to be deleted, but limit it to 3 and blur the rest out. Premium membership required.

# Welcome to your new ignited app!

[![CircleCI](https://circleci.com/gh/infinitered/ignite.svg?style=svg)](https://circleci.com/gh/infinitered/ignite)

## The latest and greatest boilerplate for Infinite Red opinions

This is the boilerplate that [Infinite Red](https://infinite.red) uses as a way to test bleeding-edge changes to our React Native stack.

Currently includes:

- React Native
- React Navigation
- MobX State Tree
- TypeScript
- And more!

## Quick Start

The Ignite boilerplate project's structure will look similar to this:

```
ignite-project
├── app
│   ├── components
│   ├── config
│   ├── i18n
│   ├── models
│   ├── navigators
│   ├── screens
│   ├── services
│   ├── theme
│   ├── utils
│   └── app.tsx
├── assets
│   ├── icons
│   └── images
├── test
│   ├── __snapshots__
│   ├── mockFile.ts
│   └── setup.ts
├── README.md
├── android
│   ├── app
│   ├── build.gradle
│   ├── gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── keystores
│   └── settings.gradle
├── ignite
│   └── templates
|       |── app-icon
│       ├── component
│       ├── model
│       ├── navigator
│       └── screen
├── index.js
├── ios
│   ├── IgniteProject
│   ├── IgniteProject-tvOS
│   ├── IgniteProject-tvOSTests
│   ├── IgniteProject.xcodeproj
│   └── IgniteProjectTests
├── .env
└── package.json

```

### ./app directory

Included in an Ignite boilerplate project is the `app` directory. This is a directory you would normally have to create when using vanilla React Native.

The inside of the `app` directory looks similar to the following:

```
app
├── components
├── config
├── i18n
├── models
├── navigators
├── screens
├── services
├── theme
├── utils
└── app.tsx
```

**components**
This is where your reusable components live which help you build your screens.

**i18n**
This is where your translations will live if you are using `react-native-i18n`.

**models**
This is where your app's models will live. Each model has a directory which will contain the `mobx-state-tree` model file, test file, and any other supporting files like actions, types, etc.

**navigators**
This is where your `react-navigation` navigators will live.

**screens**
This is where your screen components will live. A screen is a React component which will take up the entire screen and be part of the navigation hierarchy. Each screen will have a directory containing the `.tsx` file, along with any assets or other helper files.

**services**
Any services that interface with the outside world will live here (think REST APIs, Push Notifications, etc.).

**theme**
Here lives the theme for your application, including spacing, colors, and typography.

**utils**
This is a great place to put miscellaneous helpers and utilities. Things like date helpers, formatters, etc. are often found here. However, it should only be used for things that are truly shared across your application. If a helper or utility is only used by a specific component or model, consider co-locating your helper with that component or model.

**app.tsx** This is the entry point to your app. This is where you will find the main App component which renders the rest of the application.

### ./assets directory

This directory is designed to organize and store various assets, making it easy for you to manage and use them in your application. The assets are further categorized into subdirectories, including `icons` and `images`:

```
assets
├── icons
└── images
```

**icons**
This is where your icon assets will live. These icons can be used for buttons, navigation elements, or any other UI components. The recommended format for icons is PNG, but other formats can be used as well.

Ignite comes with a built-in `Icon` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/Components-Icon.md).

**images**
This is where your images will live, such as background images, logos, or any other graphics. You can use various formats such as PNG, JPEG, or GIF for your images.

Another valuable built-in component within Ignite is the `AutoImage` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/Components-AutoImage.md).

How to use your `icon` or `image` assets:

```
import { Image } from 'react-native';

const MyComponent = () => {
  return (
    <Image source={require('../assets/images/my_image.png')} />
  );
};
```

### ./ignite directory

The `ignite` directory stores all things Ignite, including CLI and boilerplate items. Here you will find templates you can customize to help you get started with React Native.

### ./test directory

This directory will hold your Jest configs and mocks.

## Running Maestro end-to-end tests

Follow our [Maestro Setup](https://ignitecookbook.com/docs/recipes/MaestroSetup) recipe from the [Ignite Cookbook](https://ignitecookbook.com/)!

## Previous Boilerplates

- [2018 aka Bowser](https://github.com/infinitered/ignite-bowser)
- [2017 aka Andross](https://github.com/infinitered/ignite-andross)
- [2016 aka Ignite 1.0](https://github.com/infinitered/ignite-ir-boilerplate-2016)
