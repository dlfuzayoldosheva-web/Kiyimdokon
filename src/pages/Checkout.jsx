import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context'
import { formatPrice, config } from '../config'
import { saveOrder } from '../orders'
import { useLanguage } from '../contexts/LanguageContext'
import { useProducts } from '../contexts/ProductContext'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { t, language, productText } = useLanguage()
  const { products } = useProducts()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const delivery = subtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryFee
  const total = subtotal + delivery

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'checkout_name_required'
    if (!form.phone.trim()) e.phone = 'checkout_phone_required'
    if (!form.city.trim()) e.city = 'checkout_city_required'
    if (!form.address.trim()) e.address = 'checkout_address_required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    const ref = 'MNT-' + Date.now().toString().slice(-8)
    const date = new Date().toISOString()
    const order = {
      id: ref,
      ref,
      customer: form.name.trim(),
      phone: form.phone.trim(),
      address: [form.city, form.district, form.address].filter(Boolean).join(', '),
      form: { ...form },
      items: items.map((item) => ({ ...item })),
      subtotal,
      delivery,
      total,
      date,
    }

    try {
      localStorage.setItem('montano_last_order', JSON.stringify(order))
      saveOrder(order)
      setSubmitError('')
      clear()
      navigate('/order-confirmation')
    } catch (error) {
      console.error('Failed to save demo order.', error)
      setSubmitError(t('checkout_save_error'))
    }
  }

  return (
    <section className="section--small">
      <div className="wrap">
        <nav style={{ marginBottom: 24 }}>
          <Link to="/cart" style={{ fontSize: 0.85, color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            ← {t('cart_title')}
          </Link>
        </nav>
        <h1>{t('checkout_title')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 500 }}>
          {t('checkout_intro')}
        </p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
          {submitError && <p className="error-text" role="alert">{t(submitError)}</p>}
          <div className="form-group">
            <label>{t('checkout_name')}</label>
            <input
              placeholder={t('checkout_name_placeholder')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <span className="error-text">{t(errors.name)}</span>}
          </div>
          <div className="form-group">
            <label>{t('checkout_phone')}</label>
            <input
              placeholder="+998 90 000 00 00"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {errors.phone && <span className="error-text">{t(errors.phone)}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('checkout_city')}</label>
              <input
                placeholder={t('checkout_city_placeholder')}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              {errors.city && <span className="error-text">{t(errors.city)}</span>}
            </div>
            <div className="form-group">
              <label>{t('checkout_district')}</label>
              <input
                placeholder={t('checkout_district_placeholder')}
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>{t('checkout_address')}</label>
            <input
              placeholder={t('checkout_address_placeholder')}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            {errors.address && <span className="error-text">{t(errors.address)}</span>}
          </div>
          <div className="form-group">
            <label>{t('checkout_notes')}</label>
            <textarea
              placeholder={t('checkout_notes_placeholder')}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 0.9, marginBottom: 8 }}>
              {t('checkout_payment')}
            </p>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 0.95, cursor: 'pointer' }}>
              <input
                type="radio"
                name="payment"
                defaultChecked
                style={{ marginRight: 8 }}
              />
              {t('checkout_cash')}
            </label>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 0.95, cursor: 'pointer', opacity: 0.5 }}>
              <input type="radio" name="payment" disabled style={{ marginRight: 8 }} />
              {t('checkout_card')}
            </label>
          </div>
          <button className="btn btn--primary" style={{ width: '100%', padding: '14px 24px', fontSize: 1 }} type="submit">
            {t('checkout_submit')}
          </button>
        </form>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, marginTop: 24 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: 24, background: 'var(--surface)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 1.25 }}>
              {t('cart_summary')}
            </h2>
            {items.map((i) => (
              <div key={i.id + '-' + i.size} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 0.95 }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {products.find((product) => product.id === i.id) ? productText(products.find((product) => product.id === i.id), 'name') : i.name} × {i.qty}
                </span>
                <span>{formatPrice(i.price * i.qty, language)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{t('cart_subtotal')}</span>
                <span>{formatPrice(subtotal, language)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{t('cart_delivery')}</span>
                <span>{delivery === 0 ? t('cart_free') : formatPrice(delivery, language)}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 1.1 }}>
                <span>{t('cart_total')}</span>
                <span>{formatPrice(total, language)}</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 0.85, margin: 0 }}>
              {t('checkout_demo_note')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
