// Pack list templates for auto-generating pack lists

export interface PackListCategory {
  title: string;
  items: {
    label: string;
    quantity?: number;
    notes?: string;
  }[];
}

// Alias for backward compatibility
export type HospitalBagCategory = PackListCategory;

export const MOM_HOSPITAL_BAG: HospitalBagCategory[] = [
  {
    title: 'Comfort & Clothing',
    items: [
      { label: 'Soft slippers', notes: 'For hard hospital floors' },
      { label: 'Cozy socks', quantity: 3 },
      { label: 'Loose, comfortable clothes', quantity: 2 },
      { label: 'Zip-up or button-down top', notes: 'For easy monitoring and nursing' },
      { label: 'Going-home outfit (loose)', notes: 'Nothing tight' },
      { label: 'Light robe or hoodie' },
      { label: 'Extra underwear', quantity: 4 },
    ],
  },
  {
    title: 'Toiletries',
    items: [
      { label: 'Toothbrush & toothpaste' },
      { label: 'Face wash & moisturizer' },
      { label: 'Chapstick', notes: 'Hospital air is dry!' },
      { label: 'Hair ties & brush' },
      { label: 'Deodorant' },
      { label: 'Hand lotion', notes: 'Air is very drying' },
      { label: 'Travel body wash/shampoo', notes: 'First shower feels incredible' },
    ],
  },
  {
    title: 'Sleep & Personal',
    items: [
      { label: 'Phone charger (extra long cord)', notes: 'Essential!' },
      { label: 'Eye mask & earplugs', notes: 'For better rest' },
      { label: 'Water bottle with straw', notes: 'Stay hydrated' },
      { label: 'Snacks', notes: 'Protein bars, gummies, nuts' },
      { label: 'Folder for paperwork', notes: 'Birth certificate, insurance forms' },
    ],
  },
  {
    title: 'Comfort Items',
    items: [
      { label: 'Small blanket', notes: 'Rooms get cold' },
      { label: 'Portable speaker or headphones' },
      { label: 'Gum or mints' },
    ],
  },
  {
    title: 'For Longer Stays',
    items: [
      { label: 'Extra set of comfy clothes', notes: 'C-section, induction, complications' },
      { label: 'More substantial snacks' },
      { label: 'Extra-long phone charger' },
      { label: 'Slippers (don\'t mind getting dirty)' },
      { label: 'Portable fan', notes: 'Temperature control' },
      { label: 'Extra pillow' },
      { label: 'Compression socks', notes: 'Helps circulation' },
    ],
  },
];

export const PARTNER_HOSPITAL_BAG: HospitalBagCategory[] = [
  {
    title: 'Comfort & Sleep',
    items: [
      { label: 'Pillow from home', notes: 'Hospital pillows are terrible' },
      { label: 'Frictionless sleep outfit', notes: 'Comfortable for sleeping' },
      { label: 'Change of clothes', quantity: 2 },
      { label: 'Cozy socks' },
      { label: 'Slippers or comfortable shoes' },
    ],
  },
  {
    title: 'Toiletries',
    items: [
      { label: 'Toothbrush & toothpaste' },
      { label: 'Deodorant' },
      { label: 'Face wash' },
      { label: 'Phone charger (extra long)' },
    ],
  },
  {
    title: 'Entertainment & Essentials',
    items: [
      { label: 'Snacks that hold up well', notes: 'You\'ll need energy!' },
      { label: 'Water bottle' },
      { label: 'Book, tablet, or entertainment' },
      { label: 'Headphones' },
      { label: 'Cash for vending machines' },
    ],
  },
  {
    title: 'Support Items',
    items: [
      { label: 'Camera or phone (charged)', notes: 'Capture first moments' },
      { label: 'Massage oil or lotion', notes: 'For labor support' },
      { label: 'Portable speaker', notes: 'For calming music' },
    ],
  },
];

export const PARTNER_EXTENDED_BAG: HospitalBagCategory[] = [
  {
    title: 'Extended Stay Items',
    items: [
      { label: 'Extra clothes', notes: 'For logistics with older child' },
      { label: 'More snacks & entertainment' },
      { label: 'Overnight clothes for shuttling' },
      { label: 'Backup phone chargers', quantity: 2, notes: 'One always disappears!' },
      { label: 'Laptop or tablet', notes: 'For work or staying connected' },
    ],
  },
];

export const BABY_HOSPITAL_BAG: HospitalBagCategory[] = [
  {
    title: 'Coming Home Outfit',
    items: [
      { label: 'Newborn outfit', notes: 'Hospital provides basics, this is for photos' },
      { label: 'Backup outfit (0-3 month)', notes: 'In case baby is bigger' },
      { label: 'Warm blanket or bunting', notes: 'Weather appropriate' },
      { label: 'Hat & mittens', notes: 'Temperature regulation' },
    ],
  },
  {
    title: 'Car Seat',
    items: [
      { label: 'Infant car seat (installed)', notes: 'Can\'t leave without it!' },
      { label: 'Car seat cover or shade', notes: 'If weather is harsh' },
    ],
  },
  {
    title: 'Just in Case',
    items: [
      { label: 'Pacifiers', quantity: 2, notes: 'If you plan to use' },
      { label: 'Burp cloths', quantity: 2 },
      { label: 'Diapers (newborn)', notes: 'Hospital provides, but good backup' },
    ],
  },
];

export const SIBLING_HOSPITAL_ITEMS: HospitalBagCategory[] = [
  {
    title: 'For Older Child at Home',
    items: [
      { label: 'Big sibling gift from baby', notes: 'Helps them feel special' },
      { label: 'Picture of older child', notes: 'For your nightstand' },
      { label: 'Simple books for sibling', quantity: 2 },
      { label: 'Pre-packed overnight bag', notes: 'For whoever is watching them' },
      { label: 'Contact list for caregiver', notes: 'Routine, meals, nap, comfort items' },
      { label: 'Pre-staged meals/snacks', notes: 'Make it easy for helpers' },
    ],
  },
];

// Helper to determine which bags to generate
export function getHospitalBagTemplates(hasOlderChildren: boolean): {
  name: string;
  categories: HospitalBagCategory[];
}[] {
  const bags = [
    { name: 'Mom\'s Hospital Bag', categories: MOM_HOSPITAL_BAG },
    { name: 'Partner\'s Hospital Bag', categories: PARTNER_HOSPITAL_BAG },
    { name: 'Baby\'s Hospital Bag', categories: BABY_HOSPITAL_BAG },
  ];

  if (hasOlderChildren) {
    bags.push(
      { name: 'Partner\'s Extended Bag (With Older Child)', categories: PARTNER_EXTENDED_BAG },
      { name: 'Sibling Prep Items', categories: SIBLING_HOSPITAL_ITEMS }
    );
  }

  return bags;
}

// Road Trip Pack List Template
export const ROAD_TRIP_TEMPLATE: PackListCategory[] = [
  {
    title: 'Snacks & Drinks',
    items: [
      { label: 'Water bottles', quantity: 4, notes: 'Stay hydrated' },
      { label: 'Protein bars or granola bars' },
      { label: 'Trail mix or nuts' },
      { label: 'Fresh fruit (apples, oranges)' },
      { label: 'Crackers or pretzels' },
      { label: 'Gum or mints', notes: 'For fresh breath' },
      { label: 'Cooler with ice', notes: 'For perishables' },
    ],
  },
  {
    title: 'Entertainment',
    items: [
      { label: 'Phone chargers (car + portable)' },
      { label: 'Music playlist or podcasts downloaded' },
      { label: 'Audiobooks' },
      { label: 'Travel games or cards' },
      { label: 'Activity books or coloring supplies', notes: 'If traveling with kids' },
    ],
  },
  {
    title: 'Comfort & Safety',
    items: [
      { label: 'Sunglasses' },
      { label: 'Sunscreen' },
      { label: 'First aid kit' },
      { label: 'Hand sanitizer & wipes' },
      { label: 'Tissues or paper towels' },
      { label: 'Blanket or travel pillow' },
      { label: 'Extra phone charger' },
      { label: 'Roadside emergency kit' },
    ],
  },
  {
    title: 'Navigation & Documents',
    items: [
      { label: 'GPS or phone navigation' },
      { label: 'Driver\'s license' },
      { label: 'Insurance documents' },
      { label: 'Emergency contact list' },
      { label: 'Printed directions or map backup' },
    ],
  },
];

// Beach Vacation Pack List Template
export const BEACH_VACATION_TEMPLATE: PackListCategory[] = [
  {
    title: 'Beach Essentials',
    items: [
      { label: 'Swimsuits', quantity: 2, notes: 'One to wear, one to dry' },
      { label: 'Beach towels', quantity: 2 },
      { label: 'Sunscreen (SPF 30+)', notes: 'Waterproof formula' },
      { label: 'Sunglasses with UV protection' },
      { label: 'Wide-brimmed hat or cap' },
      { label: 'Beach bag or tote' },
      { label: 'Flip flops or water shoes' },
      { label: 'Beach umbrella or tent', notes: 'For shade' },
    ],
  },
  {
    title: 'Water Activities',
    items: [
      { label: 'Snorkel and mask', notes: 'If snorkeling' },
      { label: 'Boogie board or inflatable' },
      { label: 'Waterproof phone case' },
      { label: 'GoPro or waterproof camera' },
    ],
  },
  {
    title: 'Comfort & Protection',
    items: [
      { label: 'Aloe vera gel', notes: 'For sunburn relief' },
      { label: 'After-sun lotion' },
      { label: 'Insect repellent' },
      { label: 'Lip balm with SPF' },
      { label: 'Beach blanket or mat' },
      { label: 'Cooler with drinks & snacks' },
      { label: 'Reusable water bottles' },
    ],
  },
  {
    title: 'Clothing',
    items: [
      { label: 'Light cover-ups or sarongs' },
      { label: 'Rash guard or swim shirt', notes: 'Extra sun protection' },
      { label: 'Light, breathable clothes' },
      { label: 'Sandals or beach shoes' },
      { label: 'Evening outfit for dinner' },
    ],
  },
];

// Camping Trip Pack List Template
export const CAMPING_TRIP_TEMPLATE: PackListCategory[] = [
  {
    title: 'Shelter & Sleep',
    items: [
      { label: 'Tent with stakes and guylines' },
      { label: 'Ground tarp or footprint' },
      { label: 'Sleeping bags', notes: 'Appropriate for temperature' },
      { label: 'Sleeping pads or air mattresses' },
      { label: 'Pillows' },
      { label: 'Extra blankets', notes: 'Nights can be cold' },
    ],
  },
  {
    title: 'Cooking & Food',
    items: [
      { label: 'Camp stove and fuel' },
      { label: 'Matches or lighter (waterproof)' },
      { label: 'Cooler with ice' },
      { label: 'Cooking pot and pan' },
      { label: 'Plates, bowls, utensils' },
      { label: 'Cutting board and knife' },
      { label: 'Coffee maker or kettle' },
      { label: 'Dish soap and sponge' },
      { label: 'Trash bags' },
      { label: 'Food storage containers' },
      { label: 'Can opener' },
    ],
  },
  {
    title: 'Clothing & Personal',
    items: [
      { label: 'Layers (base, mid, outer)', notes: 'Weather can change' },
      { label: 'Rain jacket and pants' },
      { label: 'Warm jacket or fleece' },
      { label: 'Hiking boots or shoes' },
      { label: 'Extra socks', quantity: 3 },
      { label: 'Hat and gloves', notes: 'If cold weather' },
      { label: 'Toiletries and towel' },
      { label: 'Sunscreen and bug spray' },
      { label: 'Headlamp or flashlight with extra batteries' },
    ],
  },
  {
    title: 'Safety & Navigation',
    items: [
      { label: 'First aid kit' },
      { label: 'Map and compass or GPS' },
      { label: 'Multi-tool or knife' },
      { label: 'Fire extinguisher', notes: 'For campfire safety' },
      { label: 'Whistle' },
      { label: 'Emergency contact info' },
    ],
  },
  {
    title: 'Fun & Comfort',
    items: [
      { label: 'Camp chairs' },
      { label: 'Lantern or string lights' },
      { label: 'Books or cards' },
      { label: 'Camera' },
      { label: 'Hammock', notes: 'Optional relaxation' },
      { label: 'Portable speaker', notes: 'For music' },
    ],
  },
];

// Generic helper to get templates by ID
export function getPackListTemplate(templateId: string, hasOlderChildren: boolean = false): {
  name: string;
  categories: PackListCategory[];
}[] {
  switch (templateId) {
    case 'hospital-bags':
      return getHospitalBagTemplates(hasOlderChildren);
    case 'road-trip':
      return [{ name: 'Road Trip Essentials', categories: ROAD_TRIP_TEMPLATE }];
    case 'beach-vacation':
      return [{ name: 'Beach Vacation Pack List', categories: BEACH_VACATION_TEMPLATE }];
    case 'camping-trip':
      return [{ name: 'Camping Trip Essentials', categories: CAMPING_TRIP_TEMPLATE }];
    default:
      return [];
  }
}
