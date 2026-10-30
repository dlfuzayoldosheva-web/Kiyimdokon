import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function About() {
  const { t } = useLanguage()
  const values = [
    { title: t('about_value_timeless'), description: t('about_value_timeless_desc'), mark: '01' },
    { title: t('about_value_versatile'), description: t('about_value_versatile_desc'), mark: '02' },
    { title: t('about_value_comfort'), description: t('about_value_comfort_desc'), mark: '03' },
  ]

  return (
    <main className="about-page">
      <section className="about-intro">
        <div className="wrap">
          <Link to="/" className="about-breadcrumb">← {t('back_home')}</Link>
          <div className="about-hero">
            <div className="about-copy">
              <span className="section-eyebrow">{t('about_eyebrow')}</span>
              <h1>{t('about_title')}</h1>
              <p className="about-lead">{t('about_lead')}</p>
              <p>{t('about_description')}</p>
              <Link to="/shop" className="btn btn--primary about-cta">{t('about_cta')} <span aria-hidden="true">→</span></Link>
            </div>
            <div className="about-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
                alt={t('about_image_alt')}
                loading="lazy"
              />
              <span className="about-image-caption">{t('about_image_caption')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section about-values-section">
        <div className="wrap">
          <div className="about-values-heading">
            <span className="section-eyebrow">{t('about_values_eyebrow')}</span>
            <h2>{t('about_philosophy')}</h2>
          </div>
          <div className="about-values-grid">
            {values.map((value) => (
              <article className="about-value-card" key={value.mark}>
                <span>{value.mark}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
