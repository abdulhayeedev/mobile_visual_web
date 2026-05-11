import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { setCredentials, clearCredentials } from './authSlice.js'
import {
  savePersistedAuth,
  clearPersistedAuth,
} from '../features/auth/utils/authPersistence.js'

/**
 * Keeps localStorage in sync with Redux auth (login / logout / register).
 */
export const authListenerMiddleware = createListenerMiddleware()

authListenerMiddleware.startListening({
  matcher: isAnyOf(setCredentials),
  effect: (_action, listenerApi) => {
    const auth = listenerApi.getState().auth
    if (auth.token && auth.user) {
      savePersistedAuth({
        token: auth.token,
        user: auth.user,
        expiresAt: auth.expiresAt,
        refreshToken: auth.refreshToken ?? null,
      })
    }
  },
})

authListenerMiddleware.startListening({
  actionCreator: clearCredentials,
  effect: () => {
    clearPersistedAuth()
  },
})
