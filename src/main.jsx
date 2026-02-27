import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
          <Provider store={store}>
               <BrowserRouter>
                    <App />
                    <Toaster
                         position="top-right"
                         toastOptions={{
                              duration: 3000,
                              style: {
                                   borderRadius: '12px',
                                   padding: '12px 16px',
                                   fontSize: '14px',
                              },
                              className: '!bg-white dark:!bg-surface-800 !text-surface-900 dark:!text-surface-50 !shadow-xl !border !border-surface-200 dark:!border-surface-700',
                         }}
                    />
               </BrowserRouter>
          </Provider>
     </React.StrictMode>,
)
