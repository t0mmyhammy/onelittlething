export type BabySizeItem = {
  name: string;
  icon: string; // emoji as fallback until we have SVG icons
};

export type BabyWeek = {
  week: number;
  items: BabySizeItem[];
};

export const BABY_SIZES: BabyWeek[] = [
  { week: 4, items: [
    { name: "Poppy seed", icon: "🌱" },
    { name: "Sesame seed", icon: "🌾" }
  ]},
  { week: 5, items: [
    { name: "Peppercorn", icon: "⚫" },
    { name: "Grain of rice", icon: "🍚" }
  ]},
  { week: 6, items: [
    { name: "Lentil", icon: "🫘" },
    { name: "Sweet pea", icon: "🫛" }
  ]},
  { week: 7, items: [
    { name: "Blueberry", icon: "🫐" },
    { name: "Coffee bean", icon: "☕" }
  ]},
  { week: 8, items: [
    { name: "Raspberry", icon: "🍇" },
    { name: "Kidney bean", icon: "🫘" }
  ]},
  { week: 9, items: [
    { name: "Cherry", icon: "🍒" },
    { name: "Grape", icon: "�葡" }
  ]},
  { week: 10, items: [
    { name: "Strawberry", icon: "🍓" },
    { name: "Prune", icon: "🫐" }
  ]},
  { week: 11, items: [
    { name: "Lime", icon: "🍋" },
    { name: "Brussels sprout", icon: "🥬" }
  ]},
  { week: 12, items: [
    { name: "Plum", icon: "🍑" },
    { name: "Key lime", icon: "🍋" }
  ]},
  { week: 13, items: [
    { name: "Peach", icon: "🍑" },
    { name: "Lemon", icon: "🍋" }
  ]},
  { week: 14, items: [
    { name: "Navel orange", icon: "🍊" },
    { name: "Apple", icon: "🍎" }
  ]},
  { week: 15, items: [
    { name: "Pear", icon: "🍐" },
    { name: "Avocado", icon: "🥑" }
  ]},
  { week: 16, items: [
    { name: "Avocado", icon: "🥑" },
    { name: "Turnip", icon: "🥔" }
  ]},
  { week: 17, items: [
    { name: "Pomegranate", icon: "🍎" },
    { name: "Onion", icon: "🧅" }
  ]},
  { week: 18, items: [
    { name: "Sweet potato", icon: "🍠" },
    { name: "Bell pepper", icon: "🫑" }
  ]},
  { week: 19, items: [
    { name: "Mango", icon: "🥭" },
    { name: "Heirloom tomato", icon: "🍅" }
  ]},
  { week: 20, items: [
    { name: "Banana", icon: "🍌" },
    { name: "Artichoke", icon: "🥬" }
  ]},
  { week: 21, items: [
    { name: "Carrot", icon: "🥕" },
    { name: "Pomelo", icon: "🍊" }
  ]},
  { week: 22, items: [
    { name: "Papaya", icon: "🥭" },
    { name: "Spaghetti squash", icon: "🎃" }
  ]},
  { week: 23, items: [
    { name: "Grapefruit", icon: "🍊" },
    { name: "Large mango", icon: "🥭" }
  ]},
  { week: 24, items: [
    { name: "Cantaloupe", icon: "🍈" },
    { name: "Ear of corn", icon: "🌽" }
  ]},
  { week: 25, items: [
    { name: "Rutabaga", icon: "🥔" },
    { name: "Cauliflower", icon: "🥦" }
  ]},
  { week: 26, items: [
    { name: "Lettuce head", icon: "🥬" },
    { name: "Scallions", icon: "🌿" }
  ]},
  { week: 27, items: [
    { name: "Cauliflower", icon: "🥦" },
    { name: "Head of lettuce", icon: "🥬" }
  ]},
  { week: 28, items: [
    { name: "Eggplant", icon: "🍆" },
    { name: "Large coconut", icon: "🥥" }
  ]},
  { week: 29, items: [
    { name: "Butternut squash", icon: "🎃" },
    { name: "Acorn squash", icon: "🎃" }
  ]},
  { week: 30, items: [
    { name: "Cabbage", icon: "🥬" },
    { name: "Large coconut", icon: "🥥" }
  ]},
  { week: 31, items: [
    { name: "Pineapple", icon: "🍍" },
    { name: "Coconut", icon: "🥥" }
  ]},
  { week: 32, items: [
    { name: "Jicama", icon: "🥔" },
    { name: "Napa cabbage", icon: "🥬" }
  ]},
  { week: 33, items: [
    { name: "Pineapple", icon: "🍍" },
    { name: "Butternut squash", icon: "🎃" }
  ]},
  { week: 34, items: [
    { name: "Cantaloupe", icon: "🍈" },
    { name: "Honeydew melon", icon: "🍈" }
  ]},
  { week: 35, items: [
    { name: "Honeydew melon", icon: "🍈" },
    { name: "Large pineapple", icon: "🍍" }
  ]},
  { week: 36, items: [
    { name: "Papaya", icon: "🥭" },
    { name: "Romaine lettuce", icon: "🥬" }
  ]},
  { week: 37, items: [
    { name: "Swiss chard", icon: "🥬" },
    { name: "Winter melon", icon: "🍈" }
  ]},
  { week: 38, items: [
    { name: "Leek", icon: "🌿" },
    { name: "Rhubarb", icon: "🥬" }
  ]},
  { week: 39, items: [
    { name: "Mini watermelon", icon: "🍉" },
    { name: "Small pumpkin", icon: "🎃" }
  ]},
  { week: 40, items: [
    { name: "Watermelon", icon: "🍉" },
    { name: "Pumpkin", icon: "🎃" }
  ]}
];
