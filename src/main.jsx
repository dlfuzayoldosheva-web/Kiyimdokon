import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider, FavProvider } from './context'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProductProvider } from './contexts/ProductContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <FavProvider>
          <LanguageProvider>
            <ThemeProvider>
              <ProductProvider>
                <App />
              </ProductProvider>
            </ThemeProvider>
          </LanguageProvider>
        </FavProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)

