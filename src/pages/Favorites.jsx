import { Link } from 'react-router-dom'
import { useFavs } from '../context'
import { formatPrice } from '../config'
import { useProducts } from '../contexts/ProductContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useCart } from '../context'

export default function Favorites() {
  const { favs, toggle } = useFavs()
  const { add, storageError } = useCart()
  const { products } = useProducts()
  const { t, language, productText } = useLanguage()
  const list = products.filter((p) => favs.includes(p.id))
  const storageMessage = storageError ? <p className="storefront-storage-message" role="alert">{t(storageError)}</p> : null
  if (list.length === 0) {
    return (
      <main className="section--small favorites-page">
        <div className="wrap">
          {storageMessage}
          <div className="storefront-empty-state">
            <span className="storefront-empty-icon favorites-empty-icon" aria-hidden="true">♡</span>
            <h1>{t('favorites_title')}</h1>
            <p>{t('favorites_empty_desc')}</p>
            <Link className="btn btn--primary" to="/shop">{t('cart_explore')}</Link>
          </div>
        </div>
      </main>
    )
  }
  return (
    <main className="section--small favorites-page">
      <div className="wrap">
        <nav className="storefront-breadcrumb">
          <Link to="/">
            ← {t('back_home')}
          </Link>
        </nav>
        {storageMessage}
        <header className="storefront-page-heading">
          <span className="section-eyebrow">{t('home_categories_eyebrow')}</span>
          <h1>{t('favorites_title')}</h1>
          <p>{t('favorites_description')}</p>
        </header>
        <div className="favorites-grid">
          {list.map((p) => (
            <article key={p.id} className="product-card">
              <div className="product-card__thumb">
                <Link to={`/product/${p.id}`}>
                  <img src={p.img} alt={productText(p, 'name')} loading="lazy" />
                </Link>
                <button
                  className="favorites-remove-icon"
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggle(p.id) }}
                  title={t('product_favorite_remove')}
                  aria-label={t('product_favorite_remove')}
                >
                  <span aria-hidden="true">♥</span>
                </button>
              </div>
              <div className="product-card__content">
                <div className="product-card__tags">
                  {p.newArrival && <span className="product-tag product-tag--new">{t('product_new')}</span>}
                  {p.sale && <span className="product-tag product-tag--sale">{t('product_sale')}</span>}
                </div>
                <div className="product-card__meta">
                  <Link to={`/product/${p.id}`}>
                    <h3 className="product-card__name">{productText(p, 'name')}</h3>
                  </Link>
                  <p className="product-card__price">{formatPrice(p.price, language)}</p>
                </div>
                <div className="favorites-card-actions">
                  <button
                    className="btn btn--primary"
                    type="button"
                    disabled={!p.sizes?.length || p.stock === 0}
                    onClick={() => add(p, p.sizes[0], 1)}
                  >{p.stock === 0 ? t('product_out_of_stock') : t('favorites_add_to_bag')}</button>
                  <button className="favorites-remove-text" type="button" onClick={() => toggle(p.id)}>
                    {t('favorites_remove')}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
