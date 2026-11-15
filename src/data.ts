// Every string, price and photo the site shows lives here. The Worker imports
// the menu and promo codes from this file too, so prices are checked on the
// server against the same numbers the page shows.

export const SITE = {
  name: 'Forkfast',
  tagline: 'Fast food, made fresh and delivered hot.',
  phone: '+91 8919527406',
  phoneHref: 'tel:+918919527406',
  email: 'hello@forkfast.example',
  address: 'Gurunanak Colony, Vijayawada, Andhra Pradesh',
  hours: [
    { days: 'Monday to Thursday', time: '11:00 to 23:00' },
    { days: 'Friday and Saturday', time: '11:00 to 01:00' },
    { days: 'Sunday', time: '12:00 to 22:00' },
  ],
  currency: 'INR',
  deliveryFee: 249,
  freeDeliveryOver: 2499,
  serviceFeeRate: 0.05,
  taxRate: 0.05,
  deliveryMinutes: [25, 35] as const,
  pickupMinutes: [12, 18] as const,
}

// ---------------------------------------------------------------------------
// Photos. Every dish, card and hero picks its image by key from here. The
// placeholders are generated studio cut-outs (transparent WebP) in
// public/images/photos/. To use your own photography, point `src` at a file in
// public/images/ or any URL and update `alt`. Cut-outs on a transparent
// background fit the layout best.

// Images resolve relative to the page, so the same build works served from a
// host or opened straight from disk.
const ASSET_BASE = typeof document === 'undefined' ? '/' : (document.baseURI || '/').split('#')[0].replace(/[^/]*$/, '')
const asset = (path: string) => `${ASSET_BASE}${path}`

const photo = (name: string, alt: string) => ({ src: asset(`images/photos/${name}.webp`), alt })

export const PHOTOS = {
  burger: photo('burger', 'Beef cheeseburger with tomato, red onion and lettuce'),
  burgerStack: photo('burger-stack', 'Double cheeseburger with bacon, tomato, onion and lettuce'),
  veggieBurger: photo('veggie-burger', 'Veggie burger with a herb chickpea patty'),
  chickenBurger: photo('chicken-burger', 'Crispy fried chicken burger with slaw and pickles'),
  pizzaMargherita: photo('pizza-margherita', 'Margherita pizza with mozzarella and basil'),
  pizzaPepperoni: photo('pizza-pepperoni', 'Pepperoni pizza with olives and jalapeños'),
  pizzaBoard: photo('pizza-board', 'Pepperoni pizza on a wooden serving board'),
  salad: photo('salad', 'Garden salad with tomatoes, cucumber and feta'),
  cake: photo('cake', 'Slice of chocolate layer cake with a cherry'),
  tacos: photo('tacos', 'Two crunchy beef tacos'),
  soup: photo('soup', 'Bowl of tomato soup with cream and croutons'),
  fries: photo('fries', 'Loaded cheese fries in a red carton'),
  wrap: photo('wrap', 'Chicken caesar wrap cut in half'),
  pasta: photo('pasta', 'Creamy mushroom tagliatelle'),
  wings: photo('wings', 'Crispy fried chicken pieces'),
  chickenBowl: photo('chicken-bowl', 'Bowl of glazed crispy chicken bites'),
  hotdog: photo('hotdog', 'Hot dog with mustard and crispy onions'),
  shake: photo('shake', 'Strawberry milkshake with whipped cream'),
} as const

export type PhotoKey = keyof typeof PHOTOS

export const AVATARS = [1, 2, 3, 4, 5, 6].map((n) => asset(`images/people/avatar-${n}.svg`))

// ---------------------------------------------------------------------------
// Menu

export type CategoryId = 'burgers' | 'pizza' | 'fried' | 'wraps' | 'healthy' | 'desserts' | 'drinks'

export interface Category {
  id: CategoryId
  name: string
  photo: PhotoKey
}

export const CATEGORIES: Category[] = [
  { id: 'burgers', name: 'Burgers & Fries', photo: 'burger' },
  { id: 'pizza', name: 'Pizza Paradise', photo: 'pizzaPepperoni' },
  { id: 'fried', name: 'Fried & Crispy', photo: 'fries' },
  { id: 'wraps', name: 'Sandwiches & Wraps', photo: 'wrap' },
  { id: 'healthy', name: 'Healthy Bites', photo: 'salad' },
  { id: 'desserts', name: 'Desserts & Treats', photo: 'cake' },
  { id: 'drinks', name: 'Shakes & Drinks', photo: 'shake' },
]

export type DietTag = 'vegetarian' | 'vegan' | 'spicy' | 'gluten-free'
export const DIET_LABELS: Record<DietTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  spicy: 'Spicy',
  'gluten-free': 'Gluten free',
}

export interface Option {
  id: string
  label: string
  price: number // added to the base price
}

export interface Dish {
  slug: string
  name: string
  category: CategoryId
  photo: PhotoKey
  price: number
  compareAt?: number
  rating: number
  reviews: number
  minutes: number
  calories: number
  description: string
  diet: DietTag[]
  popular?: boolean
  sizes?: Option[]
  extras?: Option[]
}

const burgerExtras: Option[] = [
  { id: 'cheese', label: 'Extra cheese', price: 79 },
  { id: 'bacon', label: 'Smoked bacon', price: 149 },
  { id: 'patty', label: 'Second patty', price: 299 },
  { id: 'jalapeno', label: 'Jalapeños', price: 59 },
]
const pizzaSizes: Option[] = [
  { id: '10', label: '10 inch', price: 0 },
  { id: '12', label: '12 inch', price: 349 },
  { id: '14', label: '14 inch', price: 599 },
]
const pizzaExtras: Option[] = [
  { id: 'mozzarella', label: 'Extra mozzarella', price: 129 },
  { id: 'chili-oil', label: 'Chili oil', price: 59 },
  { id: 'dip', label: 'Garlic dip', price: 79 },
]
const comboSizes: Option[] = [
  { id: 'solo', label: 'On its own', price: 0 },
  { id: 'meal', label: 'Meal with fries and drink', price: 399 },
]

export const MENU: Dish[] = [
  {
    slug: 'signature-smash-burger',
    name: 'Signature Smash Burger',
    category: 'burgers',
    photo: 'burger',
    price: 979,
    rating: 4.8,
    reviews: 1240,
    minutes: 18,
    calories: 780,
    description: 'Two smashed beef patties, aged cheddar, pickled red onion, tomato and our house sauce on a toasted sesame bun.',
    diet: [],
    popular: true,
    sizes: comboSizes,
    extras: burgerExtras,
  },
  {
    slug: 'gourmet-veggie-burger',
    name: 'Gourmet Veggie Burger',
    category: 'burgers',
    photo: 'veggieBurger',
    price: 889,
    rating: 4.5,
    reviews: 412,
    minutes: 16,
    calories: 560,
    description: 'A chickpea and herb patty with tomato, crisp lettuce and smoked paprika mayo on a wholewheat bun.',
    diet: ['vegetarian'],
    sizes: comboSizes,
    extras: burgerExtras.filter((e) => e.id !== 'bacon' && e.id !== 'patty'),
  },
  {
    slug: 'signature-chicken-burger',
    name: 'Signature Chicken Burger',
    category: 'burgers',
    photo: 'chickenBurger',
    price: 929,
    rating: 4.5,
    reviews: 866,
    minutes: 18,
    calories: 690,
    description: 'Buttermilk fried chicken thigh, slaw, pickles and honey hot sauce in a brioche bun.',
    diet: ['spicy'],
    popular: true,
    sizes: comboSizes,
    extras: burgerExtras.filter((e) => e.id !== 'patty'),
  },
  {
    slug: 'margherita-pizza',
    name: 'Margherita Pizza',
    category: 'pizza',
    photo: 'pizzaMargherita',
    price: 1189,
    rating: 4.8,
    reviews: 958,
    minutes: 30,
    calories: 980,
    description: 'San Marzano tomato, fior di latte, fresh basil and olive oil on a 48-hour sourdough base.',
    diet: ['vegetarian'],
    popular: true,
    sizes: pizzaSizes,
    extras: pizzaExtras,
  },
  {
    slug: 'spicy-chicken-bbq-pizza',
    name: 'Spicy Chicken BBQ Pizza',
    category: 'pizza',
    photo: 'pizzaPepperoni',
    price: 1319,
    rating: 4.7,
    reviews: 704,
    minutes: 30,
    calories: 1120,
    description: 'A fiery favourite: smoky BBQ chicken, pepperoni, black olives, jalapeños and a kick of chili.',
    diet: ['spicy'],
    sizes: pizzaSizes,
    extras: pizzaExtras,
  },
  {
    slug: 'loaded-fries',
    name: 'Loaded Cheese Fries',
    category: 'fried',
    photo: 'fries',
    price: 549,
    rating: 4.6,
    reviews: 531,
    minutes: 10,
    calories: 620,
    description: 'Skin-on fries with cheddar sauce, crispy shallots and chives.',
    diet: ['vegetarian', 'gluten-free'],
    sizes: [
      { id: 'regular', label: 'Regular', price: 0 },
      { id: 'large', label: 'Large', price: 169 },
    ],
  },
  {
    slug: 'crispy-chicken-bucket',
    name: 'Crispy Chicken Bucket',
    category: 'fried',
    photo: 'wings',
    price: 1149,
    rating: 4.7,
    reviews: 689,
    minutes: 20,
    calories: 1240,
    description: 'Eight pieces of double-dipped fried chicken with a choice of honey mustard or buffalo dip.',
    diet: ['spicy'],
    popular: true,
    sizes: [
      { id: '8', label: '8 pieces', price: 0 },
      { id: '12', label: '12 pieces', price: 499 },
    ],
    extras: [
      { id: 'honey-mustard', label: 'Honey mustard dip', price: 59 },
      { id: 'buffalo', label: 'Buffalo dip', price: 59 },
    ],
  },
  {
    slug: 'chili-hot-dog',
    name: 'Street Hot Dog',
    category: 'fried',
    photo: 'hotdog',
    price: 619,
    rating: 4.4,
    reviews: 288,
    minutes: 12,
    calories: 540,
    description: 'An all-beef frank in a soft roll with yellow mustard, ketchup and crispy onions.',
    diet: [],
    extras: [
      { id: 'cheese', label: 'Cheese sauce', price: 79 },
      { id: 'jalapeno', label: 'Jalapeños', price: 59 },
    ],
  },
  {
    slug: 'chicken-caesar-wrap',
    name: 'Chicken Caesar Wrap',
    category: 'wraps',
    photo: 'wrap',
    price: 809,
    rating: 4.5,
    reviews: 377,
    minutes: 12,
    calories: 610,
    description: 'Grilled chicken, romaine, parmesan, roasted peppers and caesar dressing in a toasted tortilla.',
    diet: [],
    extras: [{ id: 'avocado', label: 'Avocado', price: 129 }],
  },
  {
    slug: 'street-beef-tacos',
    name: 'Street Beef Tacos',
    category: 'wraps',
    photo: 'tacos',
    price: 869,
    rating: 4.6,
    reviews: 452,
    minutes: 15,
    calories: 640,
    description: 'Two crunchy tacos with slow-cooked beef, pico de gallo, shredded lettuce and lime crema.',
    diet: ['spicy', 'gluten-free'],
    sizes: [
      { id: '2', label: 'Two tacos', price: 0 },
      { id: '3', label: 'Three tacos', price: 349 },
    ],
  },
  {
    slug: 'fresh-garden-salad',
    name: 'Fresh Garden Salad',
    category: 'healthy',
    photo: 'salad',
    price: 829,
    rating: 4.8,
    reviews: 603,
    minutes: 8,
    calories: 320,
    description: 'Mixed leaves, cherry tomatoes, cucumber, red onion and feta with a lemon and herb dressing.',
    diet: ['vegetarian', 'gluten-free'],
    popular: true,
    extras: [
      { id: 'chicken', label: 'Grilled chicken', price: 249 },
      { id: 'avocado', label: 'Avocado', price: 129 },
    ],
  },
  {
    slug: 'roasted-tomato-soup',
    name: 'Roasted Tomato Soup',
    category: 'healthy',
    photo: 'soup',
    price: 569,
    rating: 4.8,
    reviews: 341,
    minutes: 8,
    calories: 290,
    description: 'Slow-roasted tomatoes and red pepper, finished with a swirl of cream and croutons.',
    diet: ['vegetarian'],
    extras: [{ id: 'bread', label: 'Garlic sourdough', price: 169 }],
  },
  {
    slug: 'creamy-mushroom-pasta',
    name: 'Creamy Mushroom Pasta',
    category: 'healthy',
    photo: 'pasta',
    price: 1059,
    rating: 4.7,
    reviews: 389,
    minutes: 20,
    calories: 820,
    description: 'Fresh tagliatelle with chestnut mushrooms, garlic, thyme and parmesan cream.',
    diet: ['vegetarian'],
    extras: [{ id: 'truffle', label: 'Truffle oil', price: 129 }],
  },
  {
    slug: 'triple-chocolate-cake',
    name: 'Triple Chocolate Cake',
    category: 'desserts',
    photo: 'cake',
    price: 469,
    rating: 4.8,
    reviews: 722,
    minutes: 5,
    calories: 620,
    description: 'Dark chocolate sponge, milk chocolate ganache and white chocolate cream, topped with a cherry.',
    diet: ['vegetarian'],
    popular: true,
  },
  {
    slug: 'strawberry-shake',
    name: 'Strawberry Shake',
    category: 'drinks',
    photo: 'shake',
    price: 419,
    rating: 4.6,
    reviews: 298,
    minutes: 5,
    calories: 480,
    description: 'Thick strawberry milkshake with whipped cream and a cherry.',
    diet: ['vegetarian', 'gluten-free'],
    sizes: [
      { id: 'regular', label: 'Regular', price: 0 },
      { id: 'large', label: 'Large', price: 129 },
    ],
  },
]

export const bySlug = (slug: string) => MENU.find((d) => d.slug === slug)
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id)

// ---------------------------------------------------------------------------
// Home page

export const HERO = {
  titleAccent: 'Delicious',
  title: 'Fast Food Today',
  body: 'We connect hungry people with food worth waiting for, then make sure nobody waits long. Whether you want a quick bite or a feast for the table, your next meal starts here.',
  cta: 'Order now',
  quote: 'The best burger I have had in ages. Super fast delivery too.',
  customers: '1,500+ happy customers',
  rating: 4.8,
}

export const PROMOS = {
  fresh: { eyebrow: 'Irresistibly tasty meals', title: 'Made fresh, served hot', upTo: 40, cta: 'Order now', to: '/menu?category=fried' },
  pizza: { eyebrow: 'Super', title: 'Delicious pizza', upTo: 50, cta: 'Order now', to: '/menu?category=pizza' },
  burger: { title: 'Loaded beef burgers', upTo: 30, ribbons: ['Limited time offer', 'Special discount'], cta: 'Order now', to: '/menu?category=burgers' },
}

export const TOP_PICKS = [
  'signature-smash-burger',
  'street-beef-tacos',
  'roasted-tomato-soup',
  'fresh-garden-salad',
  'margherita-pizza',
  'triple-chocolate-cake',
]

export const CATEGORY_BAND = {
  title: 'Explore delicious cuisine by category',
  body: 'Seven kitchens under one roof. Pick a craving and we will have it at your door while it is still hot.',
  cta: 'View all categories',
}

export interface Deal {
  slug: string
  off: number // percent off the dish's base price
  /** Each deal restarts on this cycle, so the demo always has a live timer. */
  cycleHours: number
}

export const FLASH_DEALS: Deal[] = [
  { slug: 'signature-chicken-burger', off: 45, cycleHours: 2 },
  { slug: 'creamy-mushroom-pasta', off: 40, cycleHours: 3 },
  { slug: 'spicy-chicken-bbq-pizza', off: 50, cycleHours: 1 },
  { slug: 'fresh-garden-salad', off: 30, cycleHours: 5 },
  { slug: 'gourmet-veggie-burger', off: 35, cycleHours: 3 },
]

export const STEPS = [
  { title: 'Pick your craving', body: 'Browse seven kitchens, filter by diet and build each dish the way you like it.' },
  { title: 'Checkout in seconds', body: 'Delivery or pickup, a time that suits you, and a promo code if you have one.' },
  { title: 'Track it to your door', body: 'Follow your order from the kitchen to the rider and on to your doorstep.' },
]

export const STATS = [
  { value: '28 min', label: 'average delivery' },
  { value: '4.8', label: 'average rating' },
  { value: '1,500+', label: 'orders a week' },
  { value: '7', label: 'kitchens under one roof' },
]

// ---------------------------------------------------------------------------
// Offers and promo codes (the Worker validates these)

export interface PromoCode {
  code: string
  kind: 'percent' | 'flat' | 'delivery'
  value: number
  minSubtotal: number
  title: string
  detail: string
}

export const PROMO_CODES: PromoCode[] = [
  { code: 'FIRSTBITE', kind: 'percent', value: 20, minSubtotal: 1299, title: '20% off your first order', detail: 'On orders over ₹1,299.' },
  { code: 'FREESHIP', kind: 'delivery', value: 0, minSubtotal: 1699, title: 'Free delivery', detail: 'On orders over ₹1,699, any day.' },
  { code: 'FEAST10', kind: 'flat', value: 849, minSubtotal: 4199, title: '₹849 off a feast', detail: 'On orders over ₹4,199. Perfect for the table.' },
]

export const findPromo = (code: string) => PROMO_CODES.find((p) => p.code === code.trim().toUpperCase())

// ---------------------------------------------------------------------------
// Reviews

export interface Review {
  name: string
  avatar: number
  rating: number
  date: string
  dish: string
  body: string
}

export const REVIEWS: Review[] = [
  { name: 'Priya S.', avatar: 0, rating: 5, date: '2026-11-02', dish: 'signature-smash-burger', body: 'The best burger I have had in ages. It arrived in 22 minutes and the bun was still warm. Already ordered again.' },
  { name: 'Marcus T.', avatar: 1, rating: 5, date: '2026-10-29', dish: 'margherita-pizza', body: 'Proper sourdough crust and the basil is actually fresh. Our Friday night order now.' },
  { name: 'Lena K.', avatar: 2, rating: 4, date: '2026-10-24', dish: 'fresh-garden-salad', body: 'Big portion, crunchy, and the dressing comes on the side so nothing goes soggy. Would love more feta.' },
  { name: 'Diego R.', avatar: 3, rating: 5, date: '2026-10-21', dish: 'crispy-chicken-bucket', body: 'Crispy all the way through the ride home. The buffalo dip is dangerous.' },
  { name: 'Hannah W.', avatar: 4, rating: 5, date: '2026-10-17', dish: 'triple-chocolate-cake', body: 'Ordered one slice to share. Did not share. Rich without being heavy.' },
  { name: 'Sam O.', avatar: 5, rating: 4, date: '2026-10-12', dish: 'street-beef-tacos', body: 'Great tacos and the tracking was spot on. The lime crema makes it.' },
]

// ---------------------------------------------------------------------------
// About

export const ABOUT = {
  title: 'Fast food, without the shortcuts',
  lead: 'Forkfast started as one grill and a delivery bike in the Mission. We still make every patty, dough and dressing in our own kitchen each morning.',
  body: [
    'Fast should never mean frozen. Our seven kitchens share one prep line, so a burger, a pizza and a salad can leave the pass together and reach you together.',
    'Riders are paid by the hour, not the drop, so nobody races your dinner through a red light. Packaging is compostable and every order is sealed at the pass.',
  ],
  values: [
    { title: 'Made this morning', body: 'Dough, patties, sauces and dressings are made in house every day.' },
    { title: 'Hot on arrival', body: 'Insulated bags and a 5 km delivery radius keep every order hot.' },
    { title: 'Fair to riders', body: 'Hourly pay, sick pay and e-bikes for every rider on the team.' },
  ],
  contactTopics: ['An order I placed', 'Catering and large orders', 'Partnerships', 'Something else'],
}

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About us' },
  { to: '/menu', label: 'Menu & flavors' },
  { to: '/offers', label: 'Offers' },
  { to: '/reviews', label: 'Reviews' },
]

export const FOOTER = {
  blurb: 'Fast food made fresh in Vijayawada, delivered hot in about 30 minutes or ready to collect.',
  columns: [
    { title: 'Order', links: [{ to: '/menu', label: 'Full menu' }, { to: '/offers', label: 'Offers and codes' }, { to: '/orders', label: 'Track an order' }] },
    { title: 'Forkfast', links: [{ to: '/about', label: 'About us' }, { to: '/reviews', label: 'Reviews' }, { to: '/about#contact', label: 'Contact' }] },
    { title: 'Build', links: [{ to: '/styleguide', label: 'Style guide' }] },
  ],
  newsletter: { title: 'Deals in your inbox', body: 'One email a week with new dishes and the best codes. Unsubscribe any time.' },
}
