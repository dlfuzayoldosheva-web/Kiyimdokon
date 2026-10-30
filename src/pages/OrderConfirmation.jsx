import { Link } from 'react-router-dom'
import { formatPrice } from '../config'
import { useLanguage } from '../contexts/LanguageContext'

export default function OrderConfirmation() {
  const order = JSON.parse(localStorage.getItem('montano_last_order') || 'null')
  const { t, language } = useLanguage()
  return (
    <div className="wrap pg">
      <h1>{t('order_confirmed')}</h1>
      {order ? <><p>{t('order_reference', { ref: order.ref })}</p><p>{t('cart_total')}: {formatPrice(order.total, language)}</p><p>{t('order_demo_note')}</p></> : <p>{t('order_no_found')}</p>}
      <Link className="btn" to="/shop">{t('order_continue')}</Link>
    </div>
  )
}


