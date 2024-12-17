import { Instance, SnapshotOut, types } from "mobx-state-tree"
import uuid from 'react-native-uuid';
import APIClient from "../utils/APIClient"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    deviceId: types.optional(types.maybeNull(types.string), null),
    isDisclaimerAccepted: types.optional(types.boolean, false)
  })
  .views((store) => ({
    get getDeviceId() {
      return store.deviceId
    },
  }))
  .actions((store) => ({
    generateUniqueId() {
      if (!store.deviceId) {
        console.log("Generating device ID")
        store.deviceId = uuid.v4().toString()
      }
      // Set the user ID in APIClient whenever it's generated or restored
      APIClient.getInstance().setUserId(store.deviceId)
    },
    setDisclaimerAccepted() {
      store.isDisclaimerAccepted = true
    },
    afterCreate() {
      // If we have a deviceId after rehydration, set it in APIClient
      if (store.deviceId) {
        APIClient.getInstance().setUserId(store.deviceId)
      }
    }
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}


