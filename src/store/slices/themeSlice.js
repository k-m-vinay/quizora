import { createSlice } from '@reduxjs/toolkit'

const savedTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

const initialState = {
     darkMode: savedTheme ? savedTheme === 'dark' : prefersDark,
}

if (initialState.darkMode) {
     document.documentElement.classList.add('dark')
} else {
     document.documentElement.classList.remove('dark')
}

const themeSlice = createSlice({
     name: 'theme',
     initialState,
     reducers: {
          toggleTheme: (state) => {
               state.darkMode = !state.darkMode
               localStorage.setItem('theme', state.darkMode ? 'dark' : 'light')
               if (state.darkMode) {
                    document.documentElement.classList.add('dark')
               } else {
                    document.documentElement.classList.remove('dark')
               }
          },
          setTheme: (state, action) => {
               state.darkMode = action.payload
               localStorage.setItem('theme', action.payload ? 'dark' : 'light')
               if (action.payload) {
                    document.documentElement.classList.add('dark')
               } else {
                    document.documentElement.classList.remove('dark')
               }
          },
     },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
