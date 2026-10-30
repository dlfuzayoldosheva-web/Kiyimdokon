import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart, useFavs } from "../context";
import { formatPrice } from "../config";
import { useProducts } from "../contexts/ProductContext";

const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=900&fit=crop",
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&h=900&fit=crop",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&h=900&fit=crop",
];

const CAT_IMGS = {
  shirts: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop",
  trousers: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop",
  knitwear: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop",
  outerwear: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop",
};

const Home = () => {
  const { t, language, productText } = useLanguage();
  const { add } = useCart();
  const { toggle, isFav } = useFavs();
  const { products } = useProducts();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const featuredProducts = products.filter((p) => p.featured || p.newArrival).slice(0, 4);

  const nextSlide = () => setActiveSlide((i) => (i + 1) % HERO_SLIDES.length);
  const prevSlide = () => setActiveSlide((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, activeSlide]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const categoryData = [
    { key: "shirts", title: t("cat_shirts"), img: CAT_IMGS.shirts },
    { key: "trousers", title: t("cat_trousers"), img: CAT_IMGS.trousers },
    { key: "knitwear", title: t("cat_knitwear"), img: CAT_IMGS.knitwear },
    { key: "outerwear", title: t("cat_outerwear"), img: CAT_IMGS.outerwear },
  ];

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section
        className="hero-section"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge">{t("hero_badge")}</div>
            <h1 className="hero-heading">{t("home_hero_heading")}</h1>
            <p className="hero-desc">{t("home_hero_desc")}</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn hero-btn-primary">
                {t("home_shop_collection")}
              </Link>
              <Link to="/about" className="btn hero-btn-secondary">
                {t("home_discover_story")}
              </Link>
            </div>
          </div>
          <div className="hero-image-wrap">
            <div className="hero-image">
              <img
                key={activeSlide}
                src={HERO_SLIDES[activeSlide]}
                alt={t("hero_image_alt")}
                loading="eager"
              />
            </div>
            <div className="hero-side-text">
              {t("hero_side_text")}
            </div>
            <div className="hero-carousel">
              {HERO_SLIDES.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  className={`carousel-dot${i === activeSlide ? " active" : ""}`}
                  onClick={() => setActiveSlide(i)}
                  aria-label={t("carousel_slide", { number: i + 1 })}
                  aria-current={i === activeSlide ? "true" : undefined}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
              <button type="button" className="carousel-arrow prev" onClick={prevSlide} aria-label={t("carousel_previous")}>←</button>
              <button type="button" className="carousel-arrow next" onClick={nextSlide} aria-label={t("carousel_next")}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section home-section">
        <div className="wrap">
          <div className="section-header">
            <span className="section-eyebrow">{t("home_categories_eyebrow")}</span>
            <h2>{t("home_categories")}</h2>
          </div>
          <div className="cat-grid">
            {categoryData.map((cat) => (
              <Link key={cat.key} to={`/shop?cat=${cat.key}`} className="category-card">
                <img src={cat.img} alt={cat.title} className="category-img" />
                <div className="category-overlay">
                  <span className="category-arrow">→</span>
                </div>
                <span className="category-name">{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section section--bg">
        <div className="wrap">
          <div className="section-header">
            <span className="section-eyebrow">{t("home_new_arrivals_eyebrow")}</span>
            <h2>{t("home_new_arrivals")}</h2>
          </div>
          <div className="home-product-grid">
            {featuredProducts.map((p) => (
              <article key={p.id} className="product-card">
                <div className="product-card__thumb">
                  <Link to={`/product/${p.id}`}>
                    <img src={p.img} alt={productText(p, 'name')} loading="lazy" />
                  </Link>
                </div>
                <div className="product-card__content">
                  <div className="product-card__tags">
                    {p.newArrival && <span className="product-tag product-tag--new">{t("product_new")}</span>}
                    {p.sale && <span className="product-tag product-tag--sale">{t("product_sale")}</span>}
                  </div>
                  <div className="product-card__meta">
                    <Link to={`/product/${p.id}`}>
                      <h3 className="product-card__name">{productText(p, 'name')}</h3>
                    </Link>
                    <p className="product-card__price">{formatPrice(p.price, language)}</p>
                  </div>
                  <div className="home-product-actions">
                    <button className="btn btn--primary home-product-add" disabled={!p.sizes?.length || p.stock === 0} onClick={() => add(p, p.sizes[0], 1)}>
                      {p.stock === 0 ? t("product_out_of_stock") : t("product_add_to_bag")}
                    </button>
                    <button className="btn btn--icon" onClick={() => toggle(p.id)} aria-label={t(isFav(p.id) ? "product_favorite_remove" : "product_favorite_add")} style={{ color: isFav(p.id) ? "var(--accent)" : "var(--text-secondary)" }}>
                      {isFav(p.id) ? "♥" : "♡"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link to="/shop" className="btn btn--outline">
              {t("view_all")}
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="section home-values-section">
        <div className="wrap">
          <div className="section-header">
            <span className="section-eyebrow">{t("home_brand_eyebrow")}</span>
            <h2>{t("home_brand_values")}</h2>
          </div>
          <div className="home-values-grid">
            {[
              { title: t("bv_quality_title"), desc: t("bv_quality_desc") },
              { title: t("bv_timeless_title"), desc: t("bv_timeless_desc") },
              { title: t("bv_comfort_title"), desc: t("bv_comfort_desc") },
            ].map((v) => (
              <div className="home-value-card" key={v.title}>
                <span className="home-value-mark" aria-hidden="true">M</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="section home-editorial-section">
        <div className="wrap">
          <div className="section-header">
            <span className="section-eyebrow">{t("home_editorial_eyebrow")}</span>
            <h2>{t("home_editorial")}</h2>
          </div>
          <div className="home-editorial-grid">
            {[
              { title: t("ed_1_title"), desc: t("ed_1_desc"), img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop" },
              { title: t("ed_2_title"), desc: t("ed_2_desc"), img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=600&fit=crop" },
            ].map((a) => (
              <article className="home-editorial-card" key={a.title}>
                <img src={a.img} alt={a.title} loading="lazy" />
                <div className="home-editorial-content">
                  <h3>
                    {a.title}
                  </h3>
                  <p>{a.desc}</p>
                  <Link to="/about" className="home-editorial-link">
                    {t("home_read_article")} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section home-newsletter-section">
        <div className="wrap">
          <div className="home-newsletter-content">
            <h2>{t("newsletter_heading")}</h2>
            <p>
              {t("newsletter_desc")}
            </p>
            <form className="home-newsletter-form" onSubmit={handleSubscribe}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("newsletter_placeholder")} required />
              <button type="submit" className="btn btn--primary">
                {t("newsletter_subscribe")}
              </button>
            </form>
            {subscribed && (
              <p className="home-newsletter-success" role="status">
                ✓ {t("newsletter_success")}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;