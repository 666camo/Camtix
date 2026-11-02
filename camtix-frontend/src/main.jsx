import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import SmoothScroll from './components/SmoothScroll'
import './i18n/index.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <SmoothScroll>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: '500',
              background: 'var(--surface)',
              color: 'var(--fg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--card-shadow)',
            },
            success: {
              iconTheme: { primary: 'var(--brand)', secondary: 'var(--surface)' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'var(--surface)' },
            },
          }}
        />
      </SmoothScroll>
    </ThemeProvider>
  </StrictMode>,
)
