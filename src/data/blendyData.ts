export type FlavorId = 'berry' | 'kiwi' | 'banana' | 'strawberry';

export type Box = [number, number, number, number];

export interface HeroPiece {
  item: 1 | 2 | 3;
  x: number;
  y: number;
  w: number;
  rot: number;
  mirror: boolean;
  layer: 'fruit' | 'corner';
}

export interface FlavorSpec {
  id: FlavorId;
  name: string;
  fullName: string;
  tagline: string;
  bg: string;
  tintBg: string;
  softBg: string;
  ink: string;
  sheet: string;
  items: [Box, Box, Box, Box];
  bottle: { x: number; y: number; w: number };
  pieces: HeroPiece[];
  singlePrice: number;
  sixPackPrice: number;
  twelvePackPrice: number;
  tastingNotes: string;
  pairings: string[];
  ingredients: string[];
  allergens: string;
  nutrition: {
    servingSize: string;
    calories: number;
    sugar: string;
    addedSugar: string;
    fiber: string;
    vitaminC: string;
    potassium: string;
  };
}

export interface ShopProduct {
  id: string;
  flavorId: FlavorId;
  title: string;
  subtitle: string;
  bundleType: 'Single Bottle' | '6-Pack' | '12-Pack' | 'Subscription';
  packSize: 'single' | '6-pack' | '12-pack';
  price: number;
  compareAtPrice?: number;
  subscribeEligible: boolean;
  dietary: Array<'Sugar-Free' | 'Vegan' | 'Gluten-Free'>;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
}

export interface Stockist {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  address: string;
  hours: string;
  flavorsInStock: FlavorId[];
}

export const PROXY_PREFIX =
  'https://images.higgs.ai/?default=1&output=webp&w=2048&q=85&url=';

export function proxyUrl(raw: string): string {
  return PROXY_PREFIX + encodeURIComponent(raw);
}

export const EDITORIAL_IMAGES = {
  splashStory: '/src/assets/images/blendy_splash_story_1794920763609.jpg',
  pourGlass: '/src/assets/images/blendy_pour_glass_1794920764241.jpg',
  orchardSourcing: '/src/assets/images/blendy_orchard_sourcing_1794920764474.jpg',
  lifestyleSip: '/src/assets/images/blendy_lifestyle_sip_1794920764357.jpg',
  blendingHero: '/src/assets/images/blendy_blending_hero_1794920765045.jpg',
} as const;

export const FLAVORS: FlavorSpec[] = [
  {
    id: 'berry',
    name: 'Berry',
    fullName: 'Berry Blast',
    tagline: 'Wild blackberries, crushed raspberries & sun-ripened blueberries.',
    bg: '#C2B0DC',
    tintBg: '#E3D9F0',
    softBg: '#F1ECF8',
    ink: '#3F2B63',
    sheet: proxyUrl(
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_053958_8803e421-29b1-4c24-8efd-54cae3f479b4.png'
    ),
    items: [
      [233, 60, 598, 917],
      [1209, 272, 569, 573],
      [265, 1230, 579, 572],
      [1192, 1192, 626, 641],
    ],
    bottle: { x: 518, y: 138, w: 372 },
    pieces: [
      { item: 2, x: 383, y: 178, w: 104, rot: 0, mirror: false, layer: 'fruit' },
      { item: 3, x: 960, y: 232, w: 118, rot: 0, mirror: false, layer: 'fruit' },
      { item: 1, x: 295, y: 478, w: 129, rot: -8, mirror: false, layer: 'fruit' },
      { item: 1, x: 1247, y: 455, w: 123, rot: 15, mirror: false, layer: 'fruit' },
      { item: 2, x: 968, y: 590, w: 110, rot: 30, mirror: false, layer: 'fruit' },
      { item: 1, x: -15, y: 590, w: 255, rot: 0, mirror: false, layer: 'corner' },
      { item: 3, x: 1282, y: 40, w: 200, rot: 0, mirror: false, layer: 'corner' },
    ],
    singlePrice: 5.5,
    sixPackPrice: 30.0,
    twelvePackPrice: 54.0,
    tastingNotes:
      'Jammy Pacific Northwest blackberries balanced by bright, tart red raspberries and a clean, velvety blueberry finish.',
    pairings: [
      'Toasted sourdough with almond butter',
      'Post-run recovery over crushed ice',
      'Warm oat & chia morning bowls',
    ],
    ingredients: [
      'Cold-pressed wild blackberries (38%)',
      'Crushed organic raspberries (31%)',
      'Whole Oregon blueberries (22%)',
      'Chilled coconut water (7%)',
      'Fresh lime juice & natural hibiscus extract (2%)',
    ],
    allergens: 'Free from dairy, soy, gluten, and tree nuts (contains coconut water).',
    nutrition: {
      servingSize: '330 ml (1 Bottle)',
      calories: 118,
      sugar: '11g (fruit-natural)',
      addedSugar: '0g',
      fiber: '6g',
      vitaminC: '95% DV',
      potassium: '340mg',
    },
  },
  {
    id: 'kiwi',
    name: 'Kiwi',
    fullName: 'Kiwi Zest',
    tagline: 'Bright emerald kiwi pressed whole with crisp green apple and mint.',
    bg: '#B4D58A',
    tintBg: '#DCEBC8',
    softBg: '#EEF6E4',
    ink: '#2D4813',
    sheet: proxyUrl(
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_053958_b5695e60-72da-4b5b-bfb7-a091d528af75.png'
    ),
    items: [
      [217, 90, 610, 874],
      [1204, 257, 619, 601],
      [250, 1197, 619, 522],
      [1200, 1186, 633, 650],
    ],
    bottle: { x: 504, y: 135, w: 403 },
    pieces: [
      { item: 2, x: 376, y: 170, w: 144, rot: -150, mirror: true, layer: 'fruit' },
      { item: 3, x: 960, y: 228, w: 152, rot: 0, mirror: false, layer: 'fruit' },
      { item: 1, x: 303, y: 460, w: 168, rot: 0, mirror: false, layer: 'fruit' },
      { item: 2, x: 1187, y: 462, w: 148, rot: -25, mirror: false, layer: 'fruit' },
      { item: 2, x: 946, y: 606, w: 150, rot: 10, mirror: true, layer: 'fruit' },
      { item: 1, x: -10, y: 575, w: 260, rot: 0, mirror: false, layer: 'corner' },
      { item: 3, x: 1285, y: 30, w: 200, rot: 0, mirror: false, layer: 'corner' },
    ],
    singlePrice: 5.5,
    sixPackPrice: 30.0,
    twelvePackPrice: 54.0,
    tastingNotes:
      'Zingy sun-ripened green kiwi with crisp orchard apple brightness and a cool garden-mint lift that wakes up your palate.',
    pairings: [
      'Avocado toast with chili flakes',
      'Mid-afternoon studio focus break',
      'Sparkling water spritz over cucumber',
    ],
    ingredients: [
      'Cold-pressed Hayward green kiwi (54%)',
      'Crisp Honeycrisp apple puree (30%)',
      'Young spinach & cucumber juice (10%)',
      'Cold-steeped garden mint & lime zest (6%)',
    ],
    allergens: '100% nut-free, dairy-free, soy-free, and gluten-free.',
    nutrition: {
      servingSize: '330 ml (1 Bottle)',
      calories: 105,
      sugar: '10g (fruit-natural)',
      addedSugar: '0g',
      fiber: '5g',
      vitaminC: '140% DV',
      potassium: '410mg',
    },
  },
  {
    id: 'banana',
    name: 'Banana',
    fullName: 'Banana Velvet',
    tagline: 'Creamy golden Cavendish banana whipped with vanilla bean and oat milk.',
    bg: '#F3DA8A',
    tintBg: '#F9ECC2',
    softBg: '#FCF5DF',
    ink: '#5A4106',
    sheet: proxyUrl(
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_053958_6cf14029-4bce-4c9a-b9fc-1c5b185082e3.png'
    ),
    items: [
      [194, 76, 579, 873],
      [1205, 228, 596, 597],
      [230, 1181, 624, 648],
      [1193, 1182, 646, 659],
    ],
    bottle: { x: 512, y: 135, w: 383 },
    pieces: [
      { item: 1, x: 387, y: 147, w: 123, rot: 0, mirror: false, layer: 'fruit' },
      { item: 2, x: 970, y: 223, w: 136, rot: -10, mirror: true, layer: 'fruit' },
      { item: 3, x: 298, y: 483, w: 132, rot: 15, mirror: false, layer: 'fruit' },
      { item: 2, x: 1245, y: 462, w: 150, rot: 20, mirror: false, layer: 'fruit' },
      { item: 3, x: 950, y: 582, w: 130, rot: -12, mirror: false, layer: 'fruit' },
      { item: 3, x: 0, y: 585, w: 235, rot: 0, mirror: false, layer: 'corner' },
      { item: 1, x: 1280, y: 30, w: 190, rot: 0, mirror: false, layer: 'corner' },
    ],
    singlePrice: 5.5,
    sixPackPrice: 30.0,
    twelvePackPrice: 54.0,
    tastingNotes:
      'Silky, custard-rich ripe banana blended with toasted gluten-free oat cream, Madagascar vanilla pod, and a hint of Ceylon cinnamon.',
    pairings: [
      'Double espresso poured over ice',
      'Pre-workout morning fuel',
      'Warm buckwheat pancakes',
    ],
    ingredients: [
      'Sun-ripened Cavendish banana puree (52%)',
      'Creamy gluten-free organic oat milk (41%)',
      'Cold-pressed golden pineapple (5%)',
      'Madagascar vanilla bean & sea salt (2%)',
    ],
    allergens: 'Made with certified gluten-free oats. Dairy-free & nut-free.',
    nutrition: {
      servingSize: '330 ml (1 Bottle)',
      calories: 142,
      sugar: '12g (fruit-natural)',
      addedSugar: '0g',
      fiber: '4g',
      vitaminC: '35% DV',
      potassium: '490mg',
    },
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    fullName: 'Strawberry Bliss',
    tagline: 'Sweet field-picked strawberries swirled with creamy coconut and rosewater.',
    bg: '#F2AFC0',
    tintBg: '#F8D7E0',
    softBg: '#FCEBF0',
    ink: '#6B2138',
    sheet: proxyUrl(
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_055135_cbfb5a8d-c52b-4358-a6ee-d941c6c42285.png'
    ),
    items: [
      [226, 88, 594, 887],
      [1190, 216, 561, 653],
      [257, 1168, 604, 662],
      [1240, 1169, 632, 686],
    ],
    bottle: { x: 512, y: 135, w: 386 },
    pieces: [
      { item: 1, x: 372, y: 142, w: 128, rot: 0, mirror: false, layer: 'fruit' },
      { item: 2, x: 955, y: 225, w: 117, rot: 20, mirror: false, layer: 'fruit' },
      { item: 3, x: 290, y: 455, w: 140, rot: -10, mirror: false, layer: 'fruit' },
      { item: 3, x: 1250, y: 432, w: 135, rot: 15, mirror: false, layer: 'fruit' },
      { item: 2, x: 962, y: 558, w: 146, rot: -15, mirror: false, layer: 'fruit' },
      { item: 1, x: -10, y: 555, w: 245, rot: 0, mirror: false, layer: 'corner' },
      { item: 1, x: 1285, y: 35, w: 200, rot: 20, mirror: false, layer: 'corner' },
    ],
    singlePrice: 5.5,
    sixPackPrice: 30.0,
    twelvePackPrice: 54.0,
    tastingNotes:
      'Sun-warmed Albion strawberries meet velvety young coconut milk with a delicate floral hint of pink guava and lemon verbena.',
    pairings: [
      'Flaky almond croissant',
      'Afternoon park picnic',
      'Granola & Greek-style coconut yogurt',
    ],
    ingredients: [
      'Cold-pressed Albion strawberries (56%)',
      'Pink guava puree (20%)',
      'Young coconut milk (21%)',
      'Lemon verbena & Meyer lemon juice (3%)',
    ],
    allergens: 'Free from dairy, soy, and gluten (contains coconut).',
    nutrition: {
      servingSize: '330 ml (1 Bottle)',
      calories: 124,
      sugar: '11g (fruit-natural)',
      addedSugar: '0g',
      fiber: '5g',
      vitaminC: '120% DV',
      potassium: '320mg',
    },
  },
];

export const FLAVOR_MAP: Record<FlavorId, FlavorSpec> = {
  berry: FLAVORS[0],
  kiwi: FLAVORS[1],
  banana: FLAVORS[2],
  strawberry: FLAVORS[3],
};

export const FLOOR_SHADOWS = [
  { cx: 345, cy: 650, w: 170, h: 24 },
  { cx: 720, cy: 708, w: 320, h: 30 },
  { cx: 1318, cy: 638, w: 160, h: 22 },
  { cx: 1045, cy: 760, w: 150, h: 22 },
];

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'berry-6',
    flavorId: 'berry',
    title: 'Berry Blast 6-Pack',
    subtitle: 'Wild blackberry, raspberry & blueberry',
    bundleType: '6-Pack',
    packSize: '6-pack',
    price: 30.0,
    compareAtPrice: 33.0,
    subscribeEligible: true,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.9,
    reviewCount: 284,
    isNew: true,
  },
  {
    id: 'kiwi-6',
    flavorId: 'kiwi',
    title: 'Kiwi Zest 6-Pack',
    subtitle: 'Green kiwi, orchard apple & fresh mint',
    bundleType: '6-Pack',
    packSize: '6-pack',
    price: 30.0,
    compareAtPrice: 33.0,
    subscribeEligible: true,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.8,
    reviewCount: 196,
  },
  {
    id: 'banana-6',
    flavorId: 'banana',
    title: 'Banana Velvet 6-Pack',
    subtitle: 'Golden banana, oat cream & vanilla pod',
    bundleType: '6-Pack',
    packSize: '6-pack',
    price: 30.0,
    compareAtPrice: 33.0,
    subscribeEligible: true,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.9,
    reviewCount: 241,
  },
  {
    id: 'strawberry-6',
    flavorId: 'strawberry',
    title: 'Strawberry Bliss 6-Pack',
    subtitle: 'Albion strawberry, pink guava & coconut',
    bundleType: '6-Pack',
    packSize: '6-pack',
    price: 30.0,
    compareAtPrice: 33.0,
    subscribeEligible: true,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 5.0,
    reviewCount: 312,
    isNew: true,
  },
  {
    id: 'berry-12',
    flavorId: 'berry',
    title: 'Berry Blast 12-Pack',
    subtitle: 'Weekly fridge restock — 12 chilled bottles',
    bundleType: '12-Pack',
    packSize: '12-pack',
    price: 54.0,
    compareAtPrice: 66.0,
    subscribeEligible: true,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.9,
    reviewCount: 168,
  },
  {
    id: 'strawberry-12',
    flavorId: 'strawberry',
    title: 'Strawberry Bliss 12-Pack',
    subtitle: 'Double case of sweet strawberry & guava',
    bundleType: '12-Pack',
    packSize: '12-pack',
    price: 54.0,
    compareAtPrice: 66.0,
    subscribeEligible: true,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.9,
    reviewCount: 145,
  },
  {
    id: 'kiwi-single',
    flavorId: 'kiwi',
    title: 'Kiwi Zest Single',
    subtitle: '330 ml chilled glass bottle',
    bundleType: 'Single Bottle',
    packSize: 'single',
    price: 5.5,
    subscribeEligible: false,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.8,
    reviewCount: 92,
  },
  {
    id: 'berry-single',
    flavorId: 'berry',
    title: 'Berry Blast Single',
    subtitle: '330 ml chilled glass bottle',
    bundleType: 'Single Bottle',
    packSize: 'single',
    price: 5.5,
    subscribeEligible: false,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.9,
    reviewCount: 115,
  },
  {
    id: 'banana-single',
    flavorId: 'banana',
    title: 'Banana Velvet Single',
    subtitle: '330 ml chilled glass bottle',
    bundleType: 'Single Bottle',
    packSize: 'single',
    price: 5.5,
    subscribeEligible: false,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.9,
    reviewCount: 84,
  },
  {
    id: 'strawberry-single',
    flavorId: 'strawberry',
    title: 'Strawberry Bliss Single',
    subtitle: '330 ml chilled glass bottle',
    bundleType: 'Single Bottle',
    packSize: 'single',
    price: 5.5,
    subscribeEligible: false,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 5.0,
    reviewCount: 103,
  },
  {
    id: 'kiwi-sub',
    flavorId: 'kiwi',
    title: 'Kiwi Zest Monthly Club',
    subtitle: '12-pack delivered every 4 weeks (-15%)',
    bundleType: 'Subscription',
    packSize: '12-pack',
    price: 45.9,
    compareAtPrice: 54.0,
    subscribeEligible: true,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.9,
    reviewCount: 74,
  },
  {
    id: 'banana-12',
    flavorId: 'banana',
    title: 'Banana Velvet 12-Pack',
    subtitle: 'Morning fuel case — 12 chilled bottles',
    bundleType: '12-Pack',
    packSize: '12-pack',
    price: 54.0,
    compareAtPrice: 66.0,
    subscribeEligible: true,
    dietary: ['Sugar-Free', 'Vegan', 'Gluten-Free'],
    rating: 4.8,
    reviewCount: 119,
  },
];

export const PRESS_QUOTES = [
  {
    outlet: 'Bon Appétit',
    quote:
      '“Finally, a bottled smoothie that tastes like someone actually muddled fresh berries five minutes ago.”',
  },
  {
    outlet: 'Vogue Wellness',
    quote:
      '“Zero added sugar, sculptural pastel bottles, and genuinely bright fruit acidity—Blendy owns the morning fridge.”',
  },
  {
    outlet: 'Monocle',
    quote:
      '“Playful packaging meets serious farm-direct sourcing. Kiwi Zest is the sharpest afternoon pick-me-up in town.”',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Maya Lin',
    role: 'Creative Director, Brooklyn',
    flavor: 'berry' as FlavorId,
    rating: 5,
    quote:
      'Switched my 3pm iced latte for Berry Blast. Zero crash, ridiculous berry texture, and the 12-pack subscription arrives ice cold every Monday.',
  },
  {
    name: 'Liam O’Connor',
    role: 'Endurance Coach, Austin',
    flavor: 'banana' as FlavorId,
    rating: 5,
    quote:
      'Banana Velvet has replaced my post-track shake. Clean ingredients, natural potassium, and zero chalky protein aftertaste.',
  },
  {
    name: 'Sora Takahashi',
    role: 'Pastry Chef, Los Angeles',
    flavor: 'kiwi' as FlavorId,
    rating: 5,
    quote:
      'The acidity on Kiwi Zest is spot on—tart, crisp, and never syrupy. You can taste the fresh mint on the finish.',
  },
  {
    name: 'Elena Rostova',
    role: 'Pilates Instructor, Chicago',
    flavor: 'strawberry' as FlavorId,
    rating: 5,
    quote:
      'Strawberry Bliss tastes like summer strawberries whipped with cold coconut cream. My studio clients cleared out a full 12-pack in two days.',
  },
];

export const STOCKISTS: Stockist[] = [
  {
    id: 'ny-soho',
    name: 'Mercer Street Market',
    neighborhood: 'SoHo',
    city: 'New York',
    address: '142 Mercer St, New York, NY 10012',
    hours: '7:00 AM – 9:00 PM',
    flavorsInStock: ['berry', 'kiwi', 'banana', 'strawberry'],
  },
  {
    id: 'ny-wburg',
    name: 'Berry & Wythe Grocer',
    neighborhood: 'Williamsburg',
    city: 'New York',
    address: '88 Wythe Ave, Brooklyn, NY 11249',
    hours: '7:30 AM – 10:00 PM',
    flavorsInStock: ['berry', 'kiwi', 'strawberry'],
  },
  {
    id: 'la-venice',
    name: 'Abbot Kinney Botanicals',
    neighborhood: 'Venice',
    city: 'Los Angeles',
    address: '1314 Abbot Kinney Blvd, Venice, CA 90291',
    hours: '8:00 AM – 8:00 PM',
    flavorsInStock: ['berry', 'kiwi', 'banana', 'strawberry'],
  },
  {
    id: 'la-silverlake',
    name: 'Sunset Pantry Co.',
    neighborhood: 'Silver Lake',
    city: 'Los Angeles',
    address: '3812 Sunset Blvd, Los Angeles, CA 90026',
    hours: '8:00 AM – 9:00 PM',
    flavorsInStock: ['kiwi', 'banana', 'strawberry'],
  },
  {
    id: 'atx-south',
    name: 'Congress Provisions',
    neighborhood: 'South Congress',
    city: 'Austin',
    address: '1604 S Congress Ave, Austin, TX 78704',
    hours: '7:00 AM – 9:00 PM',
    flavorsInStock: ['berry', 'banana', 'strawberry'],
  },
  {
    id: 'chi-westloop',
    name: 'Fulton Fresh Exchange',
    neighborhood: 'West Loop',
    city: 'Chicago',
    address: '915 W Fulton Market, Chicago, IL 60607',
    hours: '7:30 AM – 8:30 PM',
    flavorsInStock: ['berry', 'kiwi', 'banana', 'strawberry'],
  },
];
