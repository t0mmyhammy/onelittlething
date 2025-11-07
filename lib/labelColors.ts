// Label color options for children
export const labelColors = {
  green: {
    name: 'Green',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    hoverBorder: 'hover:border-green-300',
    selectedBorder: 'border-green-400',
    hex: '#DCFCE7', // green-100 - very soft mint
  },
  yellow: {
    name: 'Yellow',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-300',
    selectedBorder: 'border-yellow-500',
    hex: '#FEF9C3', // yellow-100 - soft butter
  },
  blue: {
    name: 'Blue',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    hoverBorder: 'hover:border-blue-300',
    selectedBorder: 'border-blue-400',
    hex: '#DBEAFE', // blue-100 - soft sky
  },
  pink: {
    name: 'Pink',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    hoverBorder: 'hover:border-pink-300',
    selectedBorder: 'border-pink-400',
    hex: '#FCE7F3', // pink-100 - soft blush
  },
  orange: {
    name: 'Orange',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    hoverBorder: 'hover:border-orange-300',
    selectedBorder: 'border-orange-400',
    hex: '#FFEDD5', // orange-100 - soft peach
  },
  purple: {
    name: 'Purple',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    hoverBorder: 'hover:border-purple-300',
    selectedBorder: 'border-purple-400',
    hex: '#F3E8FF', // purple-100 - soft lavender
  },
} as const;

export type LabelColor = keyof typeof labelColors;

export const getColorClasses = (color: string = 'yellow') => {
  const colorKey = color as LabelColor;
  return labelColors[colorKey] || labelColors.yellow;
};
