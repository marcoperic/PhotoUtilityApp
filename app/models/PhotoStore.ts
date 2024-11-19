import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const PhotoStoreModel = types
  .model("PhotoStore")
  .props({
    photoURIs: types.array(types.string),
    deletedPhotoURIs: types.array(types.string),
    imageManifest: types.frozen<Record<string, string>>({}),
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    setPhotoURIs(uris: string[]) {
      store.photoURIs.replace(uris)
    },
    addDeletedPhoto(uri: string) {
      // Remove from active photos
      store.photoURIs.replace(store.photoURIs.filter(photoUri => photoUri !== uri))
      // Add to deleted photos
      store.deletedPhotoURIs.push(uri)
    },
    removeDeletedPhoto(uri: string) {
      // Remove from deleted photos
      store.deletedPhotoURIs.replace(store.deletedPhotoURIs.filter(photoUri => photoUri !== uri))
      // Add back to active photos
      store.photoURIs.push(uri)
    },
    clearDeletedPhotos() {
      store.deletedPhotoURIs.clear()
    },
    setImageManifest(manifest: Record<string, string>) {
      store.imageManifest = manifest
    },
  }))
  .views((store) => ({
    get allPhotoURIs() {
      return store.photoURIs.slice()
    },
    get allDeletedPhotoURIs() {
      return store.deletedPhotoURIs.slice()
    },
    isPhotoDeleted(uri: string) {
      return store.deletedPhotoURIs.includes(uri)
    }
  }))

export interface PhotoStore extends Instance<typeof PhotoStoreModel> {}
export interface PhotoStoreSnapshot extends SnapshotOut<typeof PhotoStoreModel> {} 