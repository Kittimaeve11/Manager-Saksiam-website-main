import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './Context/AuthContext.tsx'
import { PageTitleProvider } from './Context/PageTitleContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PageTitleProvider>
      <App />
      </PageTitleProvider>
    </AuthProvider>
  </StrictMode>
)
