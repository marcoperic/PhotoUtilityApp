import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const DeletedPhotoModel = types.model("DeletedPhoto", {
  uri: types.string,
  similarImages: types.array(types.string),
  isSelected: types.optional(types.boolean, true), // Default to selected
  timestamp: types.optional(types.number, () => Date.now())
})

export const PhotoStoreModel = types
  .model("PhotoStore")
  .props({
    photoURIs: types.array(types.string),
    deletedPhotos: types.array(DeletedPhotoModel),
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
      // Remove duplicates from similarImages
      const uniqueSimilarImages = [...new Set(similarImages)]
      // Remove main URI and similar URIs from photoURIs
      store.photoURIs.replace(
        store.photoURIs.filter(
          (photoUri) => photoUri !== uri && !uniqueSimilarImages.includes(photoUri)
        )
      )
      // Add to deletedPhotos
      store.deletedPhotos.push({ 
        uri, 
        similarImages: uniqueSimilarImages,
        isSelected: true,
        timestamp: Date.now()
      })
    },
    togglePhotoSelection(uri: string) {
      const photo = store.deletedPhotos.find(p => p.uri === uri)
      if (photo) {
        photo.isSelected = !photo.isSelected
      }
    },
    deleteAllSelected() {
      const photosToDelete = store.deletedPhotos.filter(photo => photo.isSelected)
      photosToDelete.forEach(photo => {
        // Remove main URI and similar URIs from photoURIs
        store.photoURIs.replace(
          store.photoURIs.filter(
            (photoUri) => photoUri !== photo.uri && !photo.similarImages.includes(photoUri)
          )
        )
      })
      // Remove selected photos from deletedPhotos
      const photosToKeep = store.deletedPhotos.filter(photo => !photo.isSelected)
      store.deletedPhotos.replace(photosToKeep)
    },
    setIndexStatus(exists: boolean) {
      store.indexStatus.exists = exists
      store.indexStatus.lastChecked = Date.now()
    }
  }))
  .views((store) => ({
    get sortedDeletedPhotos() {
      return store.deletedPhotos.slice().sort((a, b) => 
        b.similarImages.length - a.similarImages.length
      )
    },
    get selectedCount() {
      return store.deletedPhotos.filter(p => p.isSelected).length
    }
  }))

export interface PhotoStore extends Instance<typeof PhotoStoreModel> {}
export interface PhotoStoreSnapshot extends SnapshotOut<typeof PhotoStoreModel> {} 