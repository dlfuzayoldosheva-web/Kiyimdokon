import { formatPrice } from './config'

export const categories = ['shirts','tshirts','trousers','knitwear','outerwear','accessories']

const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&h=750&fit=crop`

export const products = [
  { id:1, name:'Essential Cotton T-Shirt', category:'tshirts', price:189000, sizes:['S','M','L','XL'], colors:['white','black','grey'], img:img('1521572163474-6864f9cf17ab'), desc:'100% paxta, kundalik kiyim uchun mukammal.', featured:true, newArrival:true, stock:24 },
  { id:2, name:'Relaxed Oxford Shirt', category:'shirts', price:329000, sizes:['S','M','L','XL','XXL'], colors:['white','blue','beige'], img:img('1596755094514-f87e34085b2c'), desc:'Oxford mato, qulay kesim.', newArrival:true, stock:18 },
  { id:3, name:'Classic Straight Trousers', category:'trousers', price:399000, sizes:['30','32','34','36','38'], colors:['navy','grey','beige'], img:img('1473966968600-fa801b869a1a'), desc:'To‘g‘ri kesim, har kuni.', stock:15 },
  { id:4, name:'Minimal Knit Sweater', category:'knitwear', price:459000, sizes:['S','M','L','XL'], colors:['cream','navy','brown'], img:img('1434389677669-e08b4cac3105'), desc:'Merinos juni, yumshoq.', newArrival:true, stock:12 },
  { id:5, name:'Everyday Overshirt', category:'shirts', price:429000, originalPrice:499000, sizes:['S','M','L','XL'], colors:['olive','navy','brown'], img:img('1602810318383-e386cc2a3ccf'), desc:'Ko‘p qatlamli kiyim.', sale:true, stock:20 },
  { id:6, name:'Premium Polo Shirt', category:'tshirts', price:249000, sizes:['S','M','L','XL'], colors:['white','navy','green'], img:img('1586790170083-2f9ceadc732d'), desc:'Pike mato, shakl saqlaydi.', stock:30 },
  { id:7, name:'Modern Straight Jeans', category:'trousers', price:379000, sizes:['30','32','34','36','38'], colors:['blue','black','grey'], img:img('1542272604-787c3835535d'), desc:'Klassik jins.', featured:true, stock:22 },
  { id:8, name:'Lightweight Bomber Jacket', category:'outerwear', price:599000, sizes:['S','M','L','XL'], colors:['black','olive','navy'], img:img('1591047139829-d91aecb6caea'), desc:'Yengil, zamonaviy.', newArrival:true, stock:10 },
  { id:9, name:'Linen Blend Shirt', category:'shirts', price:349000, sizes:['S','M','L','XL'], colors:['white','beige','blue'], img:img('1603252109303-2751441dd157'), desc:'Ipak aralashma.', stock:16 },
  { id:10, name:'Classic Zip Hoodie', category:'knitwear', price:429000, sizes:['S','M','L','XL','XXL'], colors:['grey','black','navy'], img:img('1556821840-3a63f95609a7'), desc:'Kundalik qulaylik.', stock:25 },
  { id:11, name:'Tailored Chino Pants', category:'trousers', price:359000, sizes:['30','32','34','36','38'], colors:['beige','navy','olive'], img:img('1624378439575-d8705ad7ae80'), desc:'Chino shim.', featured:true, stock:19 },
  { id:12, name:'Minimal Leather Belt', category:'accessories', price:199000, sizes:['M','L'], colors:['brown','black'], img:img('1553062407-98eeb64c6a62'), desc:'Teri kamar.', stock:40 },
]

export { formatPrice }
export default products
