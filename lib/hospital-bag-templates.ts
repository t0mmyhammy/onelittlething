// Hospital bag templates for auto-generating pack lists

export interface HospitalBagCategory {
  title: string;
  items: {
    label: string;
    quantity?: number;
    notes?: string;
  }[];
}

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
