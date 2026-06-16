import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCurrentUser, loginUser, logoutUser } from '../api/auth.api'

const storedUser = localStorage.getItem('user')

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
}

export const login = createAsyncThunk('auth/login', async (payload) => {
  return loginUser(payload)
})

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  return getCurrentUser()
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutUser()
})

const clearStoredAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null
      state.token = null
      state.status = 'unauthenticated'
      state.error = null
      clearStoredAuth()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.status = 'authenticated'
        state.error = null
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null
        state.token = null
        state.status = 'unauthenticated'
        state.error = action.error.message || 'Login failed'
        clearStoredAuth()
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.status = 'authenticated'
        state.error = null
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.token = null
        state.status = 'unauthenticated'
        clearStoredAuth()
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.status = 'unauthenticated'
        state.error = null
        clearStoredAuth()
      })
      .addCase(logout.rejected, (state) => {
        state.user = null
        state.token = null
        state.status = 'unauthenticated'
        state.error = null
        clearStoredAuth()
      })
  },
})

export const { clearAuth } = authSlice.actions
export default authSlice.reducer
