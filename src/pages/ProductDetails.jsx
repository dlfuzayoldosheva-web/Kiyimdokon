
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart, useFavs } from '../context'
import { formatPrice } from '../config'
import { useProducts } from '../contexts/ProductContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function ProductDetails() {
  const { id } = useParams()
  const { products } = useProducts()
  const { t, language, productText } = useLanguage()
  const p = products.find((x) => x.id === +id)
  const [size, setSize] = useState(p?.sizes[0])
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState(p?.colors[0])
  const { add } = useCart()
  const { toggle, isFav } = useFavs()

  if (!p) return <div className="wrap pg">{t('product_not_found')}</div>

  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)

  const handleAdd = () => {
    if (!size) { alert(t('product_select_size')); return }
    add(p, size, qty)
  }

  return (
    <section className="section--small">
      <div className="wrap">
        <nav style={{ marginBottom: 16 }}>
          <Link to="/shop" style={{ fontSize: 0.85, color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            {t('product_back_shop')}
          </Link>
        </nav>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
          <div className="relative overflow-hidden" style={{ borderRadius: '8px', border: '1px solid var(--border)', aspectRatio: '3/4' }}>
            <img src={p.img} alt={productText(p, 'name')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />
          </div>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {p.newArrival && <span className="product-tag product-tag--new">{t('product_new_arrival')}</span>}
              {p.sale && <span className="product-tag product-tag--sale">{t('product_sale')}</span>}
            </div>
            <h1>{productText(p, 'name')}</h1>
            <p className="price" style={{ fontSize: 1.5, marginBottom: 16 }}>
              {formatPrice(p.price, language)}
              {p.originalPrice && (
                <span style={{ marginLeft: 8, fontSize: 1, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                  {formatPrice(p.originalPrice, language)}
                </span>
              )}
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
              {productText(p, 'desc')}
            </p>

            <div style={{ marginBottom: 20 }}>
              <label>{t('product_color')}</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {p.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      padding: '8px 16px',
                      border: c === color ? '2px solid var(--accent)' : '1px solid var(--border)',
                      borderRadius: '6px',
                      background: c === color ? 'var(--accent)' : 'transparent',
                      color: c === color ? '#fff' : 'inherit',
                      fontWeight: 500,
                    }}>
                    {t(`color_${c}`) === `color_${c}` ? c : t(`color_${c}`)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label>{t('product_size')}</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      width: 44, height: 44,
                      border: s === size ? '2px solid var(--text)' : '1px solid var(--border)',
                      borderRadius: '6px',
                      background: s === size ? 'var(--text)' : 'transparent',
                      color: s === size ? '#fff' : 'inherit',
                      fontWeight: 500,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label>{t('product_quantity')}</label>
              <input
                type="number"
                min="1"
                max={Number.isFinite(p.stock) ? Math.max(1, p.stock) : undefined}
                value={qty}
                onChange={(e) => setQty(Math.min(Math.max(1, +e.target.value || 1), Number.isFinite(p.stock) ? Math.max(1, p.stock) : Infinity))}
                style={{ width: 80, padding: '10px 14px', borderRadius: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleAdd} disabled={!p.sizes?.length || p.stock === 0}>
                {p.stock === 0 ? t('product_out_of_stock') : t('product_add_to_bag')}
              </button>
              <button className="btn btn--icon" onClick={() => toggle(p.id)} title={t(isFav(p.id) ? 'product_favorite_remove' : 'product_favorite_add')} aria-label={t(isFav(p.id) ? 'product_favorite_remove' : 'product_favorite_add')}>
                {isFav(p.id) ? '\u2766' : '\u2765'}
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 0.9 }}>
              {t('product_stock', { count: p.stock })}
            </p>
          </div>
        </div>

        <h2 style={{ marginTop: 56, marginBottom: 24 }}>
          {t('product_you_may_like')}
        </h2>
        <div className="grid grid--3">
          {related.map((r) => (
            <article key={r.id} className="product-card">
              <div className="product-card__thumb">
                <Link to={`/product/${r.id}`}>
                  <img src={r.img} alt={productText(r, 'name')} loading="lazy" />
                </Link>
              </div>
              <div className="product-card__content">
                <h3 className="product-card__name">{productText(r, 'name')}</h3>
                <p className="product-card__price">{formatPrice(r.price, language)}</p>
                <button className="btn btn--primary" onClick={() => add(r, r.sizes[0], 1)} disabled={!r.sizes?.length || r.stock === 0}>
                  {r.stock === 0 ? t('product_out_of_stock') : t('product_add_to_bag')}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
