import { useState } from 'react'
import { Link } from 'react-router-dom'
import { config } from '../config'
import { saveContactMessage } from '../contactMessages'
import { useLanguage } from '../contexts/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    const nextErrors = {}
    if (!String(data.name || '').trim()) nextErrors.name = 'name_required'
    if (!String(data.phone || '').trim()) nextErrors.phone = 'phone_required'
    if (!String(data.message || '').trim()) nextErrors.message = 'message_required'
    if (String(data.email || '').trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
      nextErrors.email = 'email_invalid'
    }
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length > 0) return

    try {
      saveContactMessage({
        name: String(data.name).trim(),
        phone: String(data.phone).trim(),
        email: String(data.email || '').trim(),
        message: String(data.message).trim(),
        date: new Date().toISOString(),
      })
      setSubmitted(true)
      setErrors({})
    } catch (error) {
      console.error('Failed to save contact message.', error)
      setSubmitError('contact_save_error')
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setErrors({})
    setSubmitError('')
  }

  if (submitted) {
    return (
      <main className="contact-page">
        <section className="section--small">
          <div className="wrap">
            <div className="contact-success-card" role="status">
              <span className="contact-success-icon" aria-hidden="true">✓</span>
              <span className="section-eyebrow">{t('contact_success_eyebrow')}</span>
              <h1>{t('contact_success_title')}</h1>
              <p>{t('contact_success_desc')}</p>
              <button className="btn btn--primary" type="button" onClick={resetForm}>{t('contact_send_another')}</button>
              <Link to="/" className="contact-back-link">{t('back_home')}</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="contact-page">
      <section className="section--small">
        <div className="wrap">
          <Link to="/" className="contact-breadcrumb">← {t('back_home')}</Link>
          <div className="contact-layout">
            <section className="contact-info">
              <span className="section-eyebrow">{t('contact_eyebrow')}</span>
              <h1>{t('contact_title')}</h1>
              <p className="contact-intro">{t('contact_intro')}</p>
              <div className="contact-details">
                <article className="contact-detail">
                  <span className="contact-detail-icon" aria-hidden="true">☎</span>
                  <div>
                    <h2>{t('contact_support')}</h2>
                    <a href={`tel:${config.contact.phone.replace(/[^\d+]/g, '')}`}>{config.contact.phone}</a>
                  </div>
                </article>
                <article className="contact-detail">
                  <span className="contact-detail-icon" aria-hidden="true">⌖</span>
                  <div>
                    <h2>{t('contact_location')}</h2>
                    <p>{t('contact_address')}</p>
                  </div>
                </article>
                <article className="contact-detail">
                  <span className="contact-detail-icon" aria-hidden="true">◷</span>
                  <div>
                    <h2>{t('contact_hours')}</h2>
                    <p>{config.contact.hours}</p>
                  </div>
                </article>
              </div>
              <div className="contact-socials">
                <a href={config.contact.telegram} target="_blank" rel="noopener noreferrer">Telegram <span aria-hidden="true">↗</span></a>
                <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
              </div>
            </section>

            <section className="contact-form-card">
              <h2>{t('contact_form_title')}</h2>
              <p className="contact-form-intro">{t('contact_form_intro')}</p>
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="contact-name">{t('contact_name')}</label>
                    <input id="contact-name" name="name" autoComplete="name" placeholder={t('contact_name_placeholder')} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} onChange={() => setErrors((current) => ({ ...current, name: '' }))} />
                    {errors.name && <span className="error-text" id="contact-name-error" role="alert">{t(errors.name)}</span>}
                  </div>
                  <div className="contact-field">
                    <label htmlFor="contact-phone">{t('contact_phone')}</label>
                    <input id="contact-phone" name="phone" type="tel" autoComplete="tel" placeholder="+998 90 000 00 00" required aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'contact-phone-error' : undefined} onChange={() => setErrors((current) => ({ ...current, phone: '' }))} />
                    {errors.phone && <span className="error-text" id="contact-phone-error" role="alert">{t(errors.phone)}</span>}
                  </div>
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-email">{t('contact_email')} <span>({t('optional')})</span></label>
                  <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} onChange={() => setErrors((current) => ({ ...current, email: '' }))} />
                  {errors.email && <span className="error-text" id="contact-email-error" role="alert">{t(errors.email)}</span>}
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-message">{t('contact_message')}</label>
                  <textarea id="contact-message" name="message" placeholder={t('contact_message_placeholder')} rows={5} required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} onChange={() => setErrors((current) => ({ ...current, message: '' }))} />
                  {errors.message && <span className="error-text" id="contact-message-error" role="alert">{t(errors.message)}</span>}
                </div>
                {submitError && <p className="contact-submit-error" role="alert">{t(submitError)}</p>}
                <button className="btn btn--primary" type="submit">{t('contact_submit')} <span aria-hidden="true">→</span></button>
                <p className="contact-demo-note">{t('contact_demo_note')}</p>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
