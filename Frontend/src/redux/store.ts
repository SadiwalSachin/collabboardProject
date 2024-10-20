import {configureStore} from "@reduxjs/toolkit"
import hostDataReducer from "./slices/hostData"
import  setSocket  from "./slices/socket"

export const store = configureStore({
    reducer:{
        hostData:hostDataReducer,
        socket:setSocket
    }
})

export type RootState = ReturnType<typeof store.getState>;