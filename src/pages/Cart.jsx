
import { Link } from 'react-router-dom'
import { useCart } from '../context'
import { formatPrice, config } from '../config'
import { useLanguage } from '../contexts/LanguageContext'
import { useProducts } from '../contexts/ProductContext'

export default function Cart() {
  const { items, remove, setQty, subtotal, clear, count, storageError } = useCart()
  const { t, language, productText } = useLanguage()
  const { products } = useProducts()
  const productById = new Map(products.map((product) => [product.id, product]))
  const delivery = subtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryFee
  const total = subtotal + delivery
  const storageMessage = storageError ? <p className="storefront-storage-message" role="alert">{t(storageError)}</p> : null

  if (items.length === 0) {
    return (
      <main className="section--small cart-page">
        <div className="wrap">
          {storageMessage}
          <div className="storefront-empty-state">
            <span className="storefront-empty-icon" aria-hidden="true">🛍️</span>
            <h1>{t('cart_empty_title')}</h1>
            <p>
            {t('cart_empty_desc')}
            </p>
            <Link className="btn btn--primary" to="/shop">{t('cart_explore')}</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="section--small cart-page">
      <div className="wrap">
        <nav className="storefront-breadcrumb">
          <Link to="/">
            ← {t('back_home')}
          </Link>
        </nav>
        {storageMessage}
        <header className="storefront-page-heading">
          <span className="section-eyebrow">{t('cart_summary')}</span>
          <h1>{t('cart_title')}</h1>
          <p>{t('common_products_other', { count: count })}</p>
        </header>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((i) => (
              <article className="cart-item" key={i.id + '-' + i.size}>
                <Link to={`/product/${i.id}`} className="cart-item-image">
                  <img src={i.img} alt={productById.has(i.id) ? productText(productById.get(i.id), 'name') : i.name} loading="lazy" />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${i.id}`} className="cart-item-name">
                    {productById.has(i.id) ? productText(productById.get(i.id), 'name') : i.name}
                  </Link>
                  <p>{t('cart_size', { size: i.size })}</p>
                  <strong>{formatPrice(i.price, language)}</strong>
                </div>
                <div className="cart-item-controls">
                  <div className="cart-quantity" aria-label={t('product_quantity')}>
                    <button
                      type="button"
                      onClick={() => setQty(i.id, i.size, i.qty - 1)}
                      disabled={i.qty <= 1}
                      aria-label={t('cart_decrease_quantity')}
                    >−</button>
                    <span aria-live="polite">{i.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(i.id, i.size, i.qty + 1, productById.get(i.id)?.stock)}
                      aria-label={t('cart_increase_quantity')}
                      disabled={Number.isFinite(productById.get(i.id)?.stock) && i.qty >= productById.get(i.id).stock}
                    >+</button>
                  </div>
                  <button
                    className="cart-remove-button"
                    type="button"
                    onClick={() => remove(i.id, i.size)}
                  >{t('cart_remove')}</button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>{t('cart_summary')}</h2>

            <div className="cart-summary-row">
              <span>{t('cart_subtotal')}</span>
              <span>{formatPrice(subtotal, language)}</span>
            </div>

            <div className="cart-summary-row">
              <span>{t('cart_delivery')}</span>
              <span>{delivery === 0 ? t('cart_free') : formatPrice(delivery, language)}</span>
            </div>

            <div className="cart-summary-total">
              <div>
                <span>{t('cart_total')}</span>
                <span>{formatPrice(total, language)}</span>
              </div>
            </div>

            {subtotal < config.freeDeliveryThreshold && (
              <div className="cart-delivery-hint">
                {t('cart_free_delivery_more', { amount: formatPrice(config.freeDeliveryThreshold - subtotal, language) })}
              </div>
            )}

            <Link className="btn btn--primary cart-checkout-button" to="/checkout">
              {t('cart_checkout')}
            </Link>

            <button className="cart-clear-button" type="button" onClick={clear}>
              {t('cart_clear')}
            </button>
          </aside>
        </div>

        {subtotal < config.freeDeliveryThreshold && (
          <p className="cart-delivery-caption">
            {t('cart_free_delivery_over', { amount: formatPrice(config.freeDeliveryThreshold, language) })}
          </p>
        )}
      </div>
    </main>
  )
}
