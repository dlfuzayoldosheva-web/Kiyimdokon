import { Link } from 'react-router-dom'
import { config, formatPrice } from '../config'
import { useLanguage } from '../contexts/LanguageContext'

export default function FAQ() {
  const { t, language } = useLanguage()
  const questions = [
    ['faq_q_order', 'faq_a_order'],
    ['faq_q_sizes', 'faq_a_sizes'],
    ['faq_q_choose_size', 'faq_a_choose_size'],
    ['faq_q_delivery', 'faq_a_delivery'],
    ['faq_q_returns', 'faq_a_returns'],
    ['faq_q_support', 'faq_a_support'],
  ].map(([question, answer]) => ({
    question: t(question),
    answer: answer === 'faq_a_delivery'
      ? t(answer, { threshold: formatPrice(config.freeDeliveryThreshold, language), fee: formatPrice(config.deliveryFee, language) })
      : answer === 'faq_a_support'
        ? t(answer, { phone: config.contact.phone, hours: config.contact.hours })
        : t(answer),
  }))

  return (
    <main className="faq-page">
      <section className="section--small">
        <div className="wrap">
          <Link to="/" className="faq-breadcrumb">← {t('back_home')}</Link>
          <header className="faq-heading">
            <span className="section-eyebrow">{t('faq_eyebrow')}</span>
            <h1>{t('faq_title')}</h1>
            <p>{t('faq_intro')}</p>
          </header>
          <div className="faq-content">
            <div className="faq-list">
              {questions.map((item, index) => (
                <details className="faq-item" key={item.question}>
                  <summary>
                    <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
                    <span>{item.question}</span>
                    <span className="faq-toggle" aria-hidden="true">+</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
            <aside className="faq-contact-card">
              <span className="section-eyebrow">{t('faq_help_eyebrow')}</span>
              <h2>{t('faq_help_title')}</h2>
              <p>{t('faq_help_desc')}</p>
              <Link to="/contact" className="btn btn--primary">{t('faq_contact')}</Link>
              <a href={config.contact.telegram} target="_blank" rel="noopener noreferrer" className="faq-telegram-link">
                {t('faq_telegram')} <span aria-hidden="true">↗</span>
              </a>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
