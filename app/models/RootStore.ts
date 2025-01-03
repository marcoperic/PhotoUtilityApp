import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { AuthenticationStoreModel } from "./AuthenticationStore" 
import { EpisodeStoreModel } from "./EpisodeStore" 
import { PhotoStoreModel } from "./PhotoStore"
import { PreprocessingStoreModel } from "./PreprocessingStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  authenticationStore: types.optional(AuthenticationStoreModel, {}), 
  episodeStore: types.optional(EpisodeStoreModel, {}), 
  photoStore: types.optional(PhotoStoreModel, {}),
  preprocessingStore: types.optional(PreprocessingStoreModel, {}),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
