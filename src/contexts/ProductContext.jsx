import { createContext, useContext, useState } from 'react'
import defaultProducts from '../products'

const ProductContext = createContext(null)

function loadProducts() {
  const saved = localStorage.getItem('montano_products')
  if (!saved) return defaultProducts

  const parsed = JSON.parse(saved)
  if (!Array.isArray(parsed) || parsed.some((product) => (
    !product ||
    !Number.isInteger(product.id) ||
    typeof product.name !== 'string' ||
    typeof product.category !== 'string' ||
    !Number.isFinite(product.price) ||
    !Array.isArray(product.sizes) ||
    !Array.isArray(product.colors)
  ))) {
    throw new Error('Saved product data has an invalid format.')
  }
  return parsed
}

export function ProductProvider({ children }) {
  const [catalog, setCatalog] = useState(() => {
    try {
      return { products: loadProducts(), loadError: '' }
    } catch (error) {
      console.error('Failed to load saved products.', error)
      return {
        products: defaultProducts,
        loadError: 'admin_load_products_error',
      }
    }
  })

  const saveProducts = (nextProducts) => {
    localStorage.setItem('montano_products', JSON.stringify(nextProducts))
    setCatalog({ products: nextProducts, loadError: '' })
  }

  return (
    <ProductContext.Provider value={{ ...catalog, saveProducts }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) throw new Error('useProducts must be used within a ProductProvider.')
  return context
}
