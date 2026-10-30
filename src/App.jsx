import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart, useFavs } from './context'
import { useLanguage } from './contexts/LanguageContext'
import { useTheme } from './contexts/ThemeContext'
import { config } from './config'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Favorites from './pages/Favorites'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Admin from './pages/Admin'
import OrderConfirmation from './pages/OrderConfirmation'

const NAV_LINKS = [
  { to: '/', label: 'nav_home' },
  { to: '/shop', label: 'nav_shop' },
  { to: '/about', label: 'nav_about' },
  { to: '/contact', label: 'nav_contact' },
  { to: '/faq', label: 'nav_faq' },
]

function Header() {
  const location = useLocation()
  const { count } = useCart()
  const { favs } = useFavs()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const isCurrentPage = (path) => path === '/'
    ? location.pathname === path
    : location.pathname === path || location.pathname.startsWith(`${path}/`)

  const languageControls = (
    <div className="language-switch" role="group" aria-label={t('choose_language')}>
      {['uz', 'ru'].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          className={language === code ? 'language-option language-option--active' : 'language-option'}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )

  const themeControl = (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={t(theme === 'dark' ? 'theme_switch_to_light' : 'theme_switch_to_dark')}
      title={t(theme === 'dark' ? 'theme_switch_to_light' : 'theme_switch_to_dark')}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☾' : '☼'}</span>
      <span>{t(theme === 'dark' ? 'theme_light' : 'theme_dark')}</span>
    </button>
  )

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="bar wrap">
        <Link className="logo" to="/" aria-label={`MONTANO — ${t('nav_home')}`}>MONT<span>ANO</span></Link>

        <nav className="desktop-nav" aria-label={t('nav_home')}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isCurrentPage(link.to) ? 'page' : undefined}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        <div className="tools-r">
          {languageControls}
          {themeControl}
          <Link to="/favorites" className="fav-link" aria-label={t('favorites_count', { count: favs.length })}>
            <span aria-hidden="true">♡</span><span className="tool-label">{t('favorites')}</span><span className="tool-count">{favs.length}</span>
          </Link>
          <Link to="/cart" className="bag-link" aria-label={t('bag_count', { count })}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" />
            </svg>
            <span className="tool-label">{t('bag')}</span>
            {count > 0 && (
              <span className="cart-badge" aria-hidden="true">{count}</span>
            )}
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={t(menuOpen ? 'menu_close' : 'menu_open')}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`} aria-label={t('nav_home')} aria-hidden={!menuOpen}>
        <div className="mobile-nav-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              aria-current={isCurrentPage(link.to) ? 'page' : undefined}
              tabIndex={menuOpen ? 0 : -1}
            >
              {t(link.label)}
            </Link>
          ))}
        </div>
        <div className="mobile-nav-tools">
          {languageControls}
          {themeControl}
          <Link to="/favorites" className="fav-link" tabIndex={menuOpen ? 0 : -1}>
            <span aria-hidden="true">♡</span> {t('favorites')} <span className="tool-count">{favs.length}</span>
          </Link>
          <Link to="/cart" className="bag-link" tabIndex={menuOpen ? 0 : -1}>
            <span aria-hidden="true">{t('bag')}</span> <span className="tool-count">{count}</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default function App() {
  const { t, language } = useLanguage()
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'
  useEffect(() => {
    document.title = language === 'ru' ? 'MONTANO — Премиальная мужская одежда' : 'MONTANO — Premium erkaklar kiyimi'
  }, [language])
  return (
    <>
      <div className="announcement">{t('announcement')}</div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
      </Routes>
      {!isAdmin && <footer className="site-footer">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="logo footer-logo">
                MONT<span>ANO</span>
              </Link>
              <p>{t('footer_description')}</p>
              <div className="socials">
                <a href={config.contact.telegram} target="_blank" rel="noopener noreferrer" aria-label={`MONTANO — ${t('telegram')}`} title="Telegram">TG</a>
                <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="MONTANO — Instagram" title="Instagram">IG</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>{t('footer_shop')}</h4>
              <Link to="/">{t('home')}</Link>
              <Link to="/shop">{t('shop')}</Link>
              <Link to="/favorites">{t('favorites')}</Link>
              <Link to="/cart">{t('cart')}</Link>
            </div>
            <div className="footer-col">
              <h4>{t('footer_support')}</h4>
              <Link to="/about">{t('about_us')}</Link>
              <Link to="/contact">{t('contact')}</Link>
              <Link to="/faq">{t('faq')}</Link>
              <a href={config.contact.telegram} target="_blank" rel="noopener noreferrer">{t('telegram')}</a>
            </div>
            <div className="footer-col">
              <h4>{t('footer_customer_care')}</h4>
              <a href={`tel:${config.contact.phone.replace(/[^\d+]/g, '')}`}>{config.contact.phone}</a>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(config.contact.address)}`} target="_blank" rel="noopener noreferrer">{t('contact_address')}</a>
              <span>{config.contact.hours}</span>
            </div>
          </div>
          <div className="copy">
            <span>© {new Date().getFullYear()} MONTANO. {t('footer_copyright')}</span>
            <Link to="/faq">{t('footer_faq_link')}</Link>
          </div>
        </div>
      </footer>}
      <div id="toast" className="toast"></div>
    </>
  )
}
