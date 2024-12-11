import { Instance, SnapshotOut, types } from "mobx-state-tree"

export const PreprocessingStoreModel = types
  .model("PreprocessingStore")
  .props({
    isPreprocessing: types.optional(types.boolean, false),
    progress: types.optional(types.number, 0),
  })
  .actions((store) => ({
    setIsPreprocessing(value: boolean) {
      store.isPreprocessing = value
    },
    setProgress(value: number) {
      store.progress = value
    },
  }))

export interface PreprocessingStore extends Instance<typeof PreprocessingStoreModel> {}
export interface PreprocessingStoreSnapshot extends SnapshotOut<typeof PreprocessingStoreModel> {} 