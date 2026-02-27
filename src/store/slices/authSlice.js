import { createSlice } from '@reduxjs/toolkit'

const savedUser = localStorage.getItem('user')
const savedToken = localStorage.getItem('token')

const initialState = {
     user: savedUser ? JSON.parse(savedUser) : null,
     token: savedToken || null,
     isAuthenticated: !!savedToken,
     loading: false,
     error: null,
}

const authSlice = createSlice({
     name: 'auth',
     initialState,
     reducers: {
          loginStart: (state) => {
               state.loading = true
               state.error = null
          },
          loginSuccess: (state, action) => {
               state.loading = false
               state.isAuthenticated = true
               state.user = action.payload.user
               state.token = action.payload.token
               localStorage.setItem('user', JSON.stringify(action.payload.user))
               localStorage.setItem('token', action.payload.token)
          },
          loginFailure: (state, action) => {
               state.loading = false
               state.error = action.payload
          },
          logout: (state) => {
               state.user = null
               state.token = null
               state.isAuthenticated = false
               state.error = null
               localStorage.removeItem('user')
               localStorage.removeItem('token')
          },
          clearError: (state) => {
               state.error = null
          },
          updateUser: (state, action) => {
               state.user = { ...state.user, ...action.payload }
               localStorage.setItem('user', JSON.stringify(state.user))
          },
     },
})

export const { loginStart, loginSuccess, loginFailure, logout, clearError, updateUser } = authSlice.actions
export default authSlice.reducer
