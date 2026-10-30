import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories as productCategories } from '../products'
import { useProducts } from '../contexts/ProductContext'
import { readOrders } from '../orders'
import { formatPrice } from '../config'
import { useLanguage } from '../contexts/LanguageContext'

const DEMO_PASSWORD = 'admin'
const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024
const MAX_STORED_IMAGE_SIZE = 1.5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const EMPTY_FORM = {
  name: '',
  category: productCategories[0],
  price: '',
  sizes: '',
  colors: '',
  desc: '',
  img: '',
  stock: '',
  featured: false,
  newArrival: false,
  sale: false,
  originalPrice: '',
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Image data could not be read.'))
    reader.onerror = () => reject(reader.error || new Error('Image data could not be read.'))
    reader.readAsDataURL(blob)
  })
}

async function prepareProductImage(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('admin_image_invalid_type')
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    throw new Error('admin_image_too_large')
  }

  const image = await createImageBitmap(file)
  try {
    for (const maxDimension of [1400, 1100, 850]) {
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Image could not be prepared.')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      for (const quality of [0.82, 0.68, 0.54]) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
        if (blob && blob.size <= MAX_STORED_IMAGE_SIZE) {
          return await blobToDataUrl(blob)
        }
      }
    }
  } finally {
    image.close()
  }
  throw new Error('admin_image_processing_failed')
}

function getStoredOrders() {
  try {
    return { orders: readOrders(), error: '' }
  } catch (error) {
    console.error('Failed to load saved orders.', error)
    return { orders: [], error: 'admin_load_orders_error' }
  }
}

export default function Admin() {
  const { products, saveProducts, loadError } = useProducts()
  const { t, language, productText } = useLanguage()
  const [view, setView] = useState('login')
  const [orderData, setOrderData] = useState(getStoredOrders)
  const { orders, error: ordersError } = orderData
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const imageInputRef = useRef(null)
  const imageRequestRef = useRef(0)

  useEffect(() => {
    const refreshOrders = () => {
      try {
        setOrderData({ orders: readOrders(), error: '' })
      } catch (error) {
        console.error('Failed to refresh saved orders.', error)
        setOrderData({ orders: [], error: 'admin_load_orders_error' })
      }
    }
    window.addEventListener('storage', refreshOrders)
    return () => window.removeEventListener('storage', refreshOrders)
  }, [])

  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalOrders: orders.length,
    totalSales: orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    lowStock: products.filter((product) => Number(product.stock) < 10).length,
  }), [products, orders])

  if (view === 'login') {
    const handleLogin = (event) => {
      event.preventDefault()
      if (password === DEMO_PASSWORD) {
        setLoginError('')
        setView('dashboard')
      } else {
        setLoginError('admin_login_error')
      }
    }

    return (
      <main className="admin-login">
        <div className="admin-login-card">
          <Link to="/" className="logo admin-login-logo">MONT<span>ANO</span></Link>
          <h1>{t('admin_login_title')}</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor="admin-password">{t('admin_password')}</label>
            <input
              id="admin-password"
              type="password"
              placeholder={t('admin_password_placeholder')}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {loginError && <p className="admin-message admin-message--error" role="alert">{t(loginError)}</p>}
            <button className="btn btn--primary" type="submit">{t('admin_sign_in')}</button>
            <p className="admin-login-hint">{t('admin_demo_password')} <strong>admin</strong></p>
          </form>
        </div>
      </main>
    )
  }

  const handleLogout = () => {
    setView('login')
    setPassword('')
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setIsProcessingImage(false)
    imageRequestRef.current += 1
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const resetForm = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setIsProcessingImage(false)
    imageRequestRef.current += 1
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleSave = (event) => {
    event.preventDefault()
    setFormError('')
    setNotice('')

    const price = Number(form.price)
    const stock = Number(form.stock)
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : undefined
    const sizes = form.sizes.split(',').map((size) => size.trim()).filter(Boolean)
    const colors = form.colors.split(',').map((color) => color.trim()).filter(Boolean)

    if (!form.name.trim()) return setFormError('admin_enter_name')
    if (!productCategories.includes(form.category)) return setFormError('admin_valid_category')
    if (!Number.isFinite(price) || price <= 0) return setFormError('admin_valid_price')
    if (!Number.isInteger(stock) || stock < 0) return setFormError('admin_valid_stock')
    if (sizes.length === 0) return setFormError('admin_valid_sizes')
    if (!form.img.trim()) return setFormError('admin_valid_image')
    const hasUploadedImage = form.img.startsWith('data:image/jpeg;base64,') &&
      form.img.length <= Math.ceil(MAX_STORED_IMAGE_SIZE * 4 / 3) + 32
    if (!hasUploadedImage) {
      try {
        const imageUrl = new URL(form.img)
        if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error('Unsupported image URL protocol.')
      } catch {
        return setFormError('admin_valid_image')
      }
    }
    if (form.sale && (!Number.isFinite(originalPrice) || originalPrice <= price)) {
      return setFormError('admin_valid_sale')
    }

    const product = {
      name: form.name.trim(),
      category: form.category,
      price,
      stock,
      sizes,
      colors,
      desc: form.desc.trim(),
      img: form.img.trim(),
      featured: Boolean(form.featured),
      newArrival: Boolean(form.newArrival),
      sale: Boolean(form.sale),
      originalPrice: form.sale ? originalPrice : undefined,
    }
    const nextProducts = editing === null
      ? [...products, { ...product, id: Math.max(0, ...products.map((item) => item.id)) + 1 }]
      : products.map((item) => (item.id === editing ? { ...item, ...product } : item))

    try {
      saveProducts(nextProducts)
      setNotice(editing === null ? 'admin_product_created' : 'admin_product_updated')
      resetForm()
      setActiveTab('products')
    } catch (error) {
      console.error('Failed to save products.', error)
      setFormError('admin_product_save_error')
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm(t('admin_delete_confirm'))) return
    try {
      saveProducts(products.filter((product) => product.id !== id))
      if (editing === id) resetForm()
      setNotice('admin_product_deleted')
      setFormError('')
    } catch (error) {
      console.error('Failed to delete product.', error)
      setFormError('admin_product_delete_error')
    }
  }

  const handleEdit = (product) => {
    setEditing(product.id)
    setActiveTab('products')
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      desc: product.desc || '',
      img: product.img || '',
      stock: String(product.stock ?? 0),
      featured: Boolean(product.featured),
      newArrival: Boolean(product.newArrival),
      sale: Boolean(product.sale),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    })
    setFormError('')
    setNotice('')
    setIsProcessingImage(false)
    imageRequestRef.current += 1
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const requestId = ++imageRequestRef.current
    setIsProcessingImage(true)
    setFormError('')
    setNotice('')
    try {
      const imageData = await prepareProductImage(file)
      if (requestId === imageRequestRef.current) {
        setForm((current) => ({ ...current, img: imageData }))
      }
    } catch (error) {
      if (requestId !== imageRequestRef.current) return
      if (error instanceof Error && error.message.startsWith('admin_image_')) {
        setFormError(error.message)
      } else {
        console.error('Failed to prepare product image.', error)
        setFormError('admin_image_processing_failed')
      }
    } finally {
      if (requestId === imageRequestRef.current) setIsProcessingImage(false)
    }
  }

  const toggleFeatured = (product) => {
    try {
      saveProducts(products.map((item) => (
        item.id === product.id ? { ...item, featured: !item.featured } : item
      )))
      setNotice(product.featured ? 'admin_featured_removed' : 'admin_featured_added')
      setFormError('')
    } catch (error) {
      console.error('Failed to update featured product.', error)
      setFormError('admin_storage_error')
    }
  }

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <main className="admin-dashboard">
      <div className="wrap">
        <div className="admin-topbar">
          <div>
            <Link to="/" className="logo admin-brand">MONT<span>ANO</span></Link>
            <span className="admin-subtitle">{t('admin_panel')}</span>
          </div>
          <button className="btn btn--outline" onClick={handleLogout}>{t('admin_sign_out')}</button>
        </div>

        <div className="admin-tabs" role="tablist" aria-label={t('admin_sections')}>
          {['products', 'orders', 'stats'].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? 'admin-tab admin-tab--active' : 'admin-tab'}
              onClick={() => setActiveTab(tab)}
            >
              {t(tab === 'products' ? 'admin_products' : tab === 'orders' ? 'admin_orders' : 'admin_stats')}
            </button>
          ))}
        </div>

        {loadError && <p className="admin-message admin-message--error" role="alert">{t(loadError)}</p>}
        {ordersError && <p className="admin-message admin-message--error" role="alert">{t(ordersError)}</p>}
        {notice && <p className="admin-message admin-message--success" role="status">{t(notice)}</p>}

        {activeTab === 'stats' && (
          <section className="admin-stats" aria-label={t('admin_stats')}>
            {[
              { label: t('admin_total_products'), value: stats.totalProducts },
              { label: t('admin_total_orders'), value: stats.totalOrders },
              { label: t('admin_total_sales'), value: formatPrice(stats.totalSales, language) },
              { label: t('admin_low_stock'), value: stats.lowStock },
            ].map((stat) => (
              <article className="admin-stat-card" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin_order')}</th>
                  <th>{t('admin_customer')}</th>
                  <th>{t('admin_total')}</th>
                  <th>{t('admin_date')}</th>
                  <th>{t('admin_items')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="admin-table-empty">{t('admin_no_orders')}</td></tr>
                ) : orders.map((order, index) => (
                  <tr key={order.id || order.ref || index}>
                    <td>{order.ref || order.id || '—'}</td>
                    <td>
                      <strong>{order.customer || order.form?.name || t('admin_guest')}</strong>
                      {(order.phone || order.form?.phone) && <small>{order.phone || order.form.phone}</small>}
                    </td>
                    <td>{formatPrice(Number(order.total) || 0, language)}</td>
                    <td>{order.date && !Number.isNaN(Date.parse(order.date)) ? new Date(order.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ') : '—'}</td>
                    <td>
                      {Array.isArray(order.items) ? order.items.map((item, itemIndex) => {
                        const product = products.find((entry) => entry.id === item.id)
                        return <div key={`${item.id}-${item.size}-${itemIndex}`}>{product ? productText(product, 'name') : item.name} × {item.qty}</div>
                      }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'products' && (
          <section className="admin-product-layout">
            <div>
              <div className="admin-section-heading">
                <h1>{t('admin_products')}</h1>
                <span>{t(products.length === 1 ? 'common_products_one' : 'common_products_other', { count: products.length })}</span>
              </div>
              <div className="admin-product-grid">
                {products.map((product) => (
                  <article key={product.id} className="product-card admin-product-card">
                    <div className="product-card__thumb">
                      <img src={product.img} alt={productText(product, 'name')} loading="lazy" />
                    </div>
                    <div className="product-card__content">
                      <div className="product-card__tags">
                        {product.newArrival && <span className="product-tag product-tag--new">{t('product_new')}</span>}
                        {product.sale && <span className="product-tag product-tag--sale">{t('product_sale')}</span>}
                      </div>
                      <div className="product-card__meta">
                        <Link to={`/product/${product.id}`}>
                          <h2 className="product-card__name">{productText(product, 'name')}</h2>
                        </Link>
                        <p className="product-card__price">{formatPrice(product.price, language)}</p>
                        <small>{t('admin_stock', { count: product.stock ?? 0 })}</small>
                      </div>
                      <div className="admin-product-actions">
                        <button className="btn btn--outline" onClick={() => handleEdit(product)}>{t('admin_edit')}</button>
                        <button
                          className="btn btn--outline"
                          onClick={() => toggleFeatured(product)}
                          aria-label={t(product.featured ? 'admin_featured_removed' : 'admin_featured_added')}
                          title={t(product.featured ? 'admin_featured_removed' : 'admin_featured_added')}
                        >{product.featured ? '★' : '☆'}</button>
                        <button className="btn btn--outline admin-delete-button" onClick={() => handleDelete(product.id)}>{t('admin_delete')}</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="admin-form-panel">
              <h2>{t(editing === null ? 'admin_add_product' : 'admin_edit_product')}</h2>
              <form className="admin-product-form" onSubmit={handleSave}>
                <label htmlFor="product-name">{t('admin_product_name')}</label>
                <input id="product-name" name="name" value={form.name} onChange={updateForm} required />
                <label htmlFor="product-category">{t('admin_category')}</label>
                <select id="product-category" name="category" value={form.category} onChange={updateForm} required>
                  {productCategories.map((category) => <option key={category} value={category}>{t(`cat_${category}`)}</option>)}
                </select>
                <div className="admin-form-row">
                  <div>
                    <label htmlFor="product-price">{t('admin_price')}</label>
                    <input id="product-price" name="price" type="number" min="1" step="1" value={form.price} onChange={updateForm} required />
                  </div>
                  <div>
                    <label htmlFor="product-stock">{t('admin_stock_label')}</label>
                    <input id="product-stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={updateForm} required />
                  </div>
                </div>
                <label htmlFor="product-sizes">{t('admin_sizes')}</label>
                <input id="product-sizes" name="sizes" value={form.sizes} onChange={updateForm} placeholder={t('admin_sizes_placeholder')} required />
                <label htmlFor="product-colors">{t('admin_colors')}</label>
                <input id="product-colors" name="colors" value={form.colors} onChange={updateForm} placeholder={t('admin_colors_placeholder')} />
                <label htmlFor="product-image">{t('admin_image_url')}</label>
                <input id="product-image" name="img" type="url" value={form.img.startsWith('data:image/') ? '' : form.img} onChange={updateForm} placeholder={t('admin_image_placeholder')}                 required={!form.img.startsWith('data:image/jpeg;base64,')} />
                <label htmlFor="product-image-file">{t('admin_image_gallery')}</label>
                <input
                  ref={imageInputRef}
                  id="product-image-file"
                  className="admin-image-file-input"
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={handleImageSelect}
                  disabled={isProcessingImage}
                  aria-describedby="product-image-help"
                />
                <small className="admin-image-help" id="product-image-help">{t('admin_image_gallery_help')}</small>
                {isProcessingImage && <p className="admin-image-status" role="status">{t('admin_image_processing')}</p>}
                {form.img && (
                  <div className="admin-image-preview">
                    <img src={form.img} alt={t('admin_image_preview_alt')} />
                    <span>{t('admin_image_preview_label')}</span>
                  </div>
                )}
                <label htmlFor="product-description">{t('admin_description')}</label>
                <textarea id="product-description" name="desc" value={form.desc} onChange={updateForm} rows={3} />
                <label className="admin-checkbox"><input type="checkbox" name="featured" checked={form.featured} onChange={updateForm} /> {t('admin_featured')}</label>
                <label className="admin-checkbox"><input type="checkbox" name="newArrival" checked={form.newArrival} onChange={updateForm} /> {t('admin_new_arrival')}</label>
                <label className="admin-checkbox"><input type="checkbox" name="sale" checked={form.sale} onChange={updateForm} /> {t('admin_on_sale')}</label>
                {form.sale && (
                  <>
                    <label htmlFor="product-original-price">{t('admin_original_price')}</label>
                    <input id="product-original-price" name="originalPrice" type="number" min="1" step="1" value={form.originalPrice} onChange={updateForm} required />
                  </>
                )}
                {formError && <p className="admin-message admin-message--error" role="alert">{t(formError)}</p>}
                <div className="admin-form-actions">
                  <button className="btn btn--primary" type="submit" disabled={isProcessingImage}>{t(editing === null ? 'admin_create_product' : 'admin_save_changes')}</button>
                  <button className="btn btn--outline" type="button" onClick={resetForm} disabled={isProcessingImage}>{t(editing === null ? 'admin_clear' : 'admin_cancel')}</button>
                </div>
              </form>
            </aside>
          </section>
        )}
      </div>
    </main>
  )
}
