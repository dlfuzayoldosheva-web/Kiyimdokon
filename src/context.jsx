import { createContext, useContext, useState, useEffect } from 'react'

const CartCtx = createContext()
const FavCtx = createContext()

function readStoredArray(key, isValid, errorKey) {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return { value: [], error: '' }
    const value = JSON.parse(stored)
    if (!Array.isArray(value) || !value.every(isValid)) {
      throw new Error(`Saved data for ${key} has an invalid format.`)
    }
    return { value, error: '' }
  } catch (error) {
    console.error(`Failed to load ${key}.`, error)
    return { value: [], error: errorKey }
  }
}

export function CartProvider({ children }) {
  const [storedCart] = useState(() => readStoredArray(
    'montano_cart',
    (item) => item && Number.isInteger(item.id) && typeof item.name === 'string' &&
      Number.isFinite(item.price) && item.price >= 0 && typeof item.img === 'string' &&
      typeof item.size === 'string' && Number.isInteger(item.qty) && item.qty > 0,
    'cart_storage_load_error',
  ))
  const [items, setItems] = useState(storedCart.value)
  const [storageError, setStorageError] = useState(storedCart.error)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!dirty) return
    try {
      localStorage.setItem('montano_cart', JSON.stringify(items))
      setStorageError('')
    } catch (error) {
      console.error('Failed to save cart.', error)
      setStorageError('cart_storage_save_error')
    }
  }, [items, dirty])

  const updateItems = (update) => {
    setItems(update)
    setDirty(true)
  }
  const add = (product, size, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity <= 0 || !size || product.stock === 0) return
    updateItems((previous) => {
      const current = previous.find((item) => item.id === product.id && item.size === size)
      const stockLimit = Number.isFinite(product.stock) ? Math.max(0, product.stock) : Infinity
      const nextQuantity = Math.min((current?.qty || 0) + quantity, stockLimit)
      if (nextQuantity === 0) return previous
      if (current) return previous.map((item) => item === current ? { ...item, qty: nextQuantity } : item)
      return [...previous, { id: product.id, name: product.name, price: product.price, img: product.img, size, qty: nextQuantity }]
    })
  }
  const remove = (id, size) => updateItems((previous) => previous.filter((item) => !(item.id === id && item.size === size)))
  const setQty = (id, size, quantity, stock) => updateItems((previous) => previous.map((item) => {
    if (item.id !== id || item.size !== size) return item
    const stockLimit = Number.isFinite(stock) ? Math.max(1, stock) : Infinity
    return { ...item, qty: Math.max(1, Math.min(Number.isInteger(quantity) ? quantity : 1, stockLimit)) }
  }))
  const clear = () => updateItems([])
  const count = items.reduce((total, item) => total + item.qty, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.qty, 0)
  return <CartCtx.Provider value={{ items, add, remove, setQty, clear, count, subtotal, storageError }}>{children}</CartCtx.Provider>
}
export const useCart = () => useContext(CartCtx)

export function FavProvider({ children }) {
  const [storedFavorites] = useState(() => readStoredArray(
    'montano_favs',
    (id) => Number.isInteger(id),
    'favorites_storage_load_error',
  ))
  const [favs, setFavs] = useState(storedFavorites.value)
  const [storageError, setStorageError] = useState(storedFavorites.error)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!dirty) return
    try {
      localStorage.setItem('montano_favs', JSON.stringify(favs))
      setStorageError('')
    } catch (error) {
      console.error('Failed to save favorites.', error)
      setStorageError('favorites_storage_save_error')
    }
  }, [favs, dirty])

  const toggle = (id) => {
    setFavs((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id])
    setDirty(true)
  }
  const isFav = (id) => favs.includes(id)
  return <FavCtx.Provider value={{ favs, toggle, isFav, storageError }}>{children}</FavCtx.Provider>
}
export const useFavs = () => useContext(FavCtx)

