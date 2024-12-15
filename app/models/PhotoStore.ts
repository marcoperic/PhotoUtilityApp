import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

interface DeletedPhoto {
  uri: string;
  similarImages: string[];
}

export const PhotoStoreModel = types
  .model("PhotoStore")
  .props({
    photoURIs: types.array(types.string),
    deletedPhotos: types.array(types.model({
      uri: types.string,
      similarImages: types.array(types.string)
    })),
    indexStatus: types.optional(
      types.model({
        exists: types.optional(types.boolean, false),
        lastChecked: types.optional(types.number, 0)
      }),
      { exists: false, lastChecked: 0 }
    )
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    setPhotoURIs(uris: string[]) {
      store.photoURIs.replace(uris)
    },
    addDeletedPhoto(uri: string, similarImages: string[] = []) {
      store.photoURIs.replace(store.photoURIs.filter(photoUri => photoUri !== uri))
      store.deletedPhotos.push({ uri, similarImages })
    },
    removeDeletedPhoto(uri: string) {
      store.deletedPhotos.replace(store.deletedPhotos.filter(photo => photo.uri !== uri))
      store.photoURIs.push(uri)
    },
    clearDeletedPhotos() {
      store.deletedPhotos.clear()
    },
    setIndexStatus(exists: boolean) {
      store.indexStatus.exists = exists
      store.indexStatus.lastChecked = Date.now()
    }
  }))
  .views((store) => ({
    get allPhotoURIs() {
      return store.photoURIs.slice()
    },
    get allDeletedPhotoURIs() {
      return store.deletedPhotos.slice().map(photo => photo.uri)
    },
    isPhotoDeleted(uri: string) {
      return store.deletedPhotos.some(photo => photo.uri === uri)
    }
  }))

export interface PhotoStore extends Instance<typeof PhotoStoreModel> {}
export interface PhotoStoreSnapshot extends SnapshotOut<typeof PhotoStoreModel> {} 