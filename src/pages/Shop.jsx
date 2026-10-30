
import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context'
import { formatPrice } from '../config'
import { useProducts } from '../contexts/ProductContext'
import { useLanguage } from '../contexts/LanguageContext'

const CATEGORIES = ['shirts', 'tshirts', 'trousers', 'knitwear', 'outerwear', 'accessories']

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCategory = searchParams.get('cat')
  const cat = CATEGORIES.includes(requestedCategory) ? requestedCategory : 'all'
  const [sort, setSort] = useState('recommended')
  const [q, setQ] = useState('')
  const { add } = useCart()
  const { products } = useProducts()
  const { t, language, productText } = useLanguage()
  const categoryLabel = (category) => t(`cat_${category}`)

  useEffect(() => {
    if (requestedCategory && cat === 'all') {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        next.delete('cat')
        return next
      }, { replace: true })
    }
  }, [cat, requestedCategory, setSearchParams])

  const selectCategory = (category) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (category === 'all') next.delete('cat')
      else next.set('cat', category)
      return next
    })
  }

  const filtered = useMemo(() => {
    let r = products.filter((p) => {
      const matchCat = cat === 'all' || p.category === cat
      const matchQ =
      productText(p, 'name').toLowerCase().includes(q.toLowerCase()) ||
      productText(p, 'desc').toLowerCase().includes(q.toLowerCase())

      return matchCat && matchQ
    })

    if (sort === 'priceAsc') r = [...r].sort((a, b) => a.price - b.price)
    if (sort === 'priceDesc') r = [...r].sort((a, b) => b.price - a.price)
    if (sort === 'newest') {
      r = [...r].sort(
        (a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)
      )
    }

    return r
  }, [cat, sort, q, products, language])

  return (
    <main className="section--small shop-page">
      <div className="wrap">
        <Link to="/" className="shop-breadcrumb">← {t('back_home')}</Link>

        <div className="shop-heading">
          <span className="section-eyebrow">{t('shop_eyebrow')}</span>
          <h1>{cat !== 'all' ? categoryLabel(cat) : t('shop_title')}</h1>
          <p>
            {cat !== 'all'
              ? t('shop_category_description', { category: categoryLabel(cat) })
              : t('shop_description')}
          </p>
        </div>

        <div className="shop-toolbar">
          <div className="shop-search">
            <label className="visually-hidden" htmlFor="shop-search">{t('shop_search')}</label>
            <input
              id="shop-search"
              type="search"
              placeholder={t('shop_search')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <label className="shop-control">
            <span>{t('shop_category')}</span>
            <select value={cat} onChange={(e) => selectCategory(e.target.value)}>
              <option value="all">{t('shop_all_categories')}</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{categoryLabel(category)}</option>
              ))}
            </select>
          </label>
          <label className="shop-control">
            <span>{t('shop_sort')}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">{t('shop_recommended')}</option>
              <option value="newest">{t('shop_newest')}</option>
              <option value="priceAsc">{t('shop_price_asc')}</option>
              <option value="priceDesc">{t('shop_price_desc')}</option>
            </select>
          </label>
        </div>

        <div className="shop-results-bar" aria-live="polite">
          <p>{t(filtered.length === 1 ? 'shop_product_count_one' : 'shop_product_count_other', { count: filtered.length })}</p>
          {q && <button type="button" onClick={() => setQ('')}>{t('shop_clear_search')}</button>}
        </div>

        {filtered.length === 0 ? (
          <div className="shop-empty-state">
            <span aria-hidden="true">⌕</span>
            <h2>{t('shop_empty_title')}</h2>
            <p>{t('shop_empty_desc')}</p>
            <button type="button" className="btn btn--primary" onClick={() => { setQ(''); selectCategory('all') }}>
              {t('shop_clear_filters')}
            </button>
          </div>
        ) : (
          <div className="shop-product-grid">
            {filtered.map((p) => (
              <article key={p.id} className="product-card">
                <div className="product-card__thumb">
                  <Link to={`/product/${p.id}`}>
                    <img src={p.img} alt={productText(p, 'name')} loading="lazy" />
                  </Link>
                  {p.newArrival && <span className="shop-product-badge">{t('product_new')}</span>}
                </div>

                <div className="product-card__content">
                  <div className="product-card__tags">
                    {p.newArrival && (
                      <span className="product-tag product-tag--new">
                        {t('product_new')}
                      </span>
                    )}

                    {p.sale && (
                      <span className="product-tag product-tag--sale">
                        {t('product_sale')}
                      </span>
                    )}
                  </div>

                  <div className="product-card__meta">
                    <Link to={`/product/${p.id}`}>
                      <h3 className="product-card__name">{productText(p, 'name')}</h3>
                    </Link>

                    <p className="product-card__price">
                      {formatPrice(p.price, language)}
                    </p>
                  </div>

                  <div className="product-card__footer">
                    <button
                      className="btn btn--primary"
                      disabled={!p.sizes?.length || p.stock === 0}
                      onClick={() => add(p, p.sizes[0], 1)}
                    >
                      {p.stock === 0 ? t('product_out_of_stock') : t('product_add_to_bag')}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
