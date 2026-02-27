import { createSlice } from '@reduxjs/toolkit'

const initialState = {
     tests: [],
     currentTest: null,
     loading: false,
     error: null,
}

const testSlice = createSlice({
     name: 'tests',
     initialState,
     reducers: {
          setLoading: (state, action) => {
               state.loading = action.payload
          },
          setTests: (state, action) => {
               state.tests = action.payload
               state.loading = false
          },
          setCurrentTest: (state, action) => {
               state.currentTest = action.payload
               state.loading = false
          },
          addTest: (state, action) => {
               state.tests.push(action.payload)
          },
          updateTest: (state, action) => {
               const index = state.tests.findIndex(t => t._id === action.payload._id)
               if (index !== -1) state.tests[index] = action.payload
          },
          removeTest: (state, action) => {
               state.tests = state.tests.filter(t => t._id !== action.payload)
          },
          setError: (state, action) => {
               state.error = action.payload
               state.loading = false
          },
          clearTestState: (state) => {
               state.currentTest = null
               state.error = null
          },
     },
})

export const { setLoading, setTests, setCurrentTest, addTest, updateTest, removeTest, setError, clearTestState } = testSlice.actions
export default testSlice.reducer
