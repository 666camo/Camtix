import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './i18n/index.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '14px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        },
        success: {
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
          iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
        },
        error: {
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
          iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
        },
      }}
    />
  </StrictMode>,
)

