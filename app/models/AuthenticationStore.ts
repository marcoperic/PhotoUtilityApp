import { Instance, SnapshotOut, types } from "mobx-state-tree"
import uuid from 'react-native-uuid';

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
    },
    setDisclaimerAccepted() {
      store.isDisclaimerAccepted = true
    }
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}


