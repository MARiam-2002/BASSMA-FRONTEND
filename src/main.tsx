import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { LanguageProvider } from './i18n/LanguageProvider'

const storedLang = localStorage.getItem('bassma-lang')
if (storedLang === 'en') {
  document.documentElement.lang = 'en'
  document.documentElement.dir = 'ltr'
  document.body.className = 'lang-en'
  document.title = 'Basma | Digital Agency'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
