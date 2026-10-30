export const config = {
  brand: 'MONTANO',
  slogan: 'Less, but better.',
  currency: { uz: 'soʻm', ru: 'сум' },
  deliveryFee: 30000,
  freeDeliveryThreshold: 700000,
  contact: {
    phone: '+998 90 000 00 00',
    telegram: 'https://t.me/montano_uz',
    instagram: 'https://instagram.com/montano.uz',
    address: 'Toshkent, Chilonzor, Bunyodkor 12',
    hours: '10:00 — 20:00',
  },
  demoMode: true,
}
export function formatPrice(n, language = 'uz') {
  const locale = language === 'ru' ? 'ru-RU' : 'uz-UZ'
  return new Intl.NumberFormat(locale).format(n) + ' ' + config.currency[language]
}
