import { createSlice } from '@reduxjs/toolkit'
import { loadPersistedAuth } from '../features/auth/utils/authPersistence.js'

function buildInitialState() {
  const persisted = loadPersistedAuth()
  if (!persisted) {
    return {
      token: null,
      user: null,
      expiresAt: null,
      refreshToken: null,
    }
  }
  return {
    token: persisted.token,
    user: persisted.user,
    expiresAt: persisted.expiresAt,
    refreshToken: persisted.refreshToken ?? null,
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: buildInitialState(),
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token
      state.user = action.payload.user
      state.expiresAt =
        action.payload.expiresAt !== undefined
          ? action.payload.expiresAt
          : null
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken ?? null
      }
    },
    clearCredentials(state) {
      state.token = null
      state.user = null
      state.expiresAt = null
      state.refreshToken = null
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
