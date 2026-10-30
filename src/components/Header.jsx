import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { Link } from 'react-router-dom'

const Header = () => {
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="header" style={{ background: '#fff', padding: '16px 0', borderBottom: '1px solid #eee' }}>
      <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        <Link to="/" style={{ fontSize: '1.7rem', display: 'block', marginBottom: 12, color: '#333' }}>
          MONT<span style={{ color: '#e85d04' }}>ANO</span>
        </Link>

        <nav style={{ display: 'flex', gap: '32px', marginTop: '16px' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>{t('nav_home')}</Link>
          <Link to="/shop" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>{t('nav_shop')}</Link>
          <Link to="/about" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>{t('nav_about')}</Link>
          <Link to="/contact" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>{t('nav_contact')}</Link>
          <Link to="/faq" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>{t('nav_faq')}</Link>
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
          {/* Language toggle */}
          <div style={{ 
            border: '1px solid #ddd', borderRadius: '20px', padding: '4px 12px', 
            display: 'flex', gap: '4px', background: '#f9f9f9' 
          }}>
            <button 
              onClick={() => setLanguage('uz')}
              style={{ 
                border: 'none', background: language === 'uz' ? '#e85d04' : 'transparent', 
                color: language === 'uz' ? '#fff' : '#333', padding: '4px 8px', 
                borderRadius: '12px', cursor: 'pointer', fontWeight: '600'
              }}
            >
              UZ
            </button>
            <button 
              onClick={() => setLanguage('ru')}
              style={{ 
                border: 'none', background: language === 'ru' ? '#e85d04' : 'transparent', 
                color: language === 'ru' ? '#fff' : '#333', padding: '4px 8px', 
                borderRadius: '12px', cursor: 'pointer', fontWeight: '600'
              }}
            >
              RU
            </button>
          </div>

          {/* Theme toggle (Day/Night) */}
          <div style={{ 
            border: '1px solid #ddd', borderRadius: '20px', padding: '4px 12px', 
            display: 'flex', gap: '4px', background: '#f9f9f9' 
          }}>
            <button 
              onClick={() => toggleTheme()}
              style={{ 
                border: 'none', background: theme === 'dark' ? '#e85d04' : 'transparent', 
                color: theme === 'dark' ? '#fff' : '#333', padding: '4px 8px', 
                borderRadius: '12px', cursor: 'pointer', fontWeight: '600'
              }}
            >
              {theme === 'dark' ? 'Night' : 'Day'}
            </button>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Header;