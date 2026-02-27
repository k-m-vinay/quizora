import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import testReducer from './slices/testSlice'
import examReducer from './slices/examSlice'
import themeReducer from './slices/themeSlice'

export const store = configureStore({
     reducer: {
          auth: authReducer,
          tests: testReducer,
          exam: examReducer,
          theme: themeReducer,
     },
})
