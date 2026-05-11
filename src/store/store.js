import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import { authListenerMiddleware } from './authListener.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(authListenerMiddleware.middleware),
})
