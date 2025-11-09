'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  PlusIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  LinkIcon,
  ShieldCheckIcon,
  UserIcon,
  ShoppingBagIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  photo_url: string | null;
  label_color: string | null;
}

interface ChildSize {
  child_id: string;
  shoe_size: string | null;
  pants_size: string | null;
  shirt_size: string | null;
  notes: string | null;
  favorite_colors: string | null;
  favorite_styles: string | null;
  favorite_brands: string | null;
}

interface InventoryItem {
  id: string;
  child_id: string;
  category: string;
  item_name: string;
  size: string | null;
  fit_notes: string | null;
  brand: string | null;
  state: 'need_it' | 'dont_need_it' | 'hidden';
  next_size_up: boolean;
  photo_url: string | null;
}

interface ShoppingItem {
  id: string;
  child_id: string;
  family_id: string;
  item_name: string;
  category: string | null;
  is_completed: boolean;
  notes: string | null;
  url: string | null;
  color: string | null;
  size: string | null;
  brand: string | null;
  price: number | null;
  status: 'idle' | 'selected' | 'reserved' | 'purchased';
  reserved_by: string | null;
  sensitive: boolean;
  updated_at: string | null;
  created_at: string;
}

const CATEGORIES = [
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'shoes', name: 'Shoes', icon: '👟' },
  { id: 'outerwear', name: 'Outerwear & Accessories', icon: '🧥' },
  { id: 'toys', name: 'Toys & Games', icon: '🎲' },
  { id: 'books', name: 'Books & Learning', icon: '📚' },
  { id: 'activities', name: 'Activities & Gear', icon: '⚽' },
  { id: 'comfort', name: 'Comfort & Sleep', icon: '🛌' },
];

interface ChildInventoryViewProps {
  child: Child;
  sizes: ChildSize | null;
  inventoryItems: InventoryItem[];
  shoppingItems: ShoppingItem[];
  familyId: string;
  onUpdateSizes: (sizes: Partial<ChildSize>) => void;
}

export default function ChildInventoryView({
  child,
  sizes,
  inventoryItems: initialInventory,
  shoppingItems: initialShopping,
  familyId,
  onUpdateSizes,
}: ChildInventoryViewProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [shopping, setShopping] = useState<ShoppingItem[]>(initialShopping);
  const [filter, setFilter] = useState<'all' | 'needs' | 'hidden' | 'next_size' | 'completed'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.id)));
  const [showCompleted, setShowCompleted] = useState(false);

  // Inventory form state
  const [newItemCategory, setNewItemCategory] = useState('clothing');
  const [newItemName, setNewItemName] = useState('');
  const [newItemSize, setNewItemSize] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');

  // Shopping form state
  const [newShoppingUrl, setNewShoppingUrl] = useState('');
  const [newShoppingName, setNewShoppingName] = useState('');
  const [newShoppingPrice, setNewShoppingPrice] = useState('');

  // Editing state
  const [editingSizeField, setEditingSizeField] = useState<string | null>(null);
  const [editingSizeValue, setEditingSizeValue] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ShoppingItem>>({});

  // Toast state
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const supabase = createClient();

  // Show toast notification
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Cycle through inventory item states
  const cycleItemState = async (item: InventoryItem) => {
    const stateOrder: Array<'need_it' | 'dont_need_it' | 'hidden'> = ['need_it', 'dont_need_it', 'hidden'];
    const currentIndex = stateOrder.indexOf(item.state);
    const nextState = stateOrder[(currentIndex + 1) % stateOrder.length];

    const { error } = await supabase
      .from('inventory_items')
      .update({ state: nextState })
      .eq('id', item.id);

    if (!error) {
      setInventory(items =>
        items.map(i => (i.id === item.id ? { ...i, state: nextState } : i))
      );

      const stateLabels = { need_it: 'Need It', dont_need_it: "Don't Need", hidden: 'Hidden' };
      showToast(`${item.item_name} marked as ${stateLabels[nextState]}`);
    }
  };

  // Add inventory item
  const addInventoryItem = async () => {
    if (!newItemName.trim()) return;

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        child_id: child.id,
        category: newItemCategory,
        item_name: newItemName.trim(),
        size: newItemSize || null,
        brand: newItemBrand || null,
        state: 'need_it',
      })
      .select()
      .single();

    if (!error && data) {
      setInventory([...inventory, data]);
      setNewItemName('');
      setNewItemSize('');
      setNewItemBrand('');
      showToast(`Added ${data.item_name} to inventory`);
    }
  };

  // Delete inventory item
  const deleteInventoryItem = async (id: string) => {
    const item = inventory.find(i => i.id === id);
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setInventory(items => items.filter(i => i.id !== id));
      if (item) showToast(`Deleted ${item.item_name}`);
    }
  };

  // Size editing
  const startEditingSize = (field: string, currentValue: string | null) => {
    setEditingSizeField(field);
    setEditingSizeValue(currentValue || '');
  };

  const saveSizeEdit = async () => {
    if (!editingSizeField) return;

    const updates = { [editingSizeField]: editingSizeValue || null };
    await onUpdateSizes(updates);

    showToast(`${editingSizeField.replace('_', ' ')} updated to ${editingSizeValue || 'empty'}`);
    setEditingSizeField(null);
    setEditingSizeValue('');
  };

  const cancelSizeEdit = () => {
    setEditingSizeField(null);
    setEditingSizeValue('');
  };

  // Shopping item functions
  const addShoppingItem = async () => {
    if (!newShoppingName.trim() && !newShoppingUrl.trim()) return;

    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert({
        child_id: child.id,
        family_id: familyId,
        item_name: newShoppingName.trim() || 'Unnamed Item',
        url: newShoppingUrl || null,
        price: newShoppingPrice ? parseFloat(newShoppingPrice) : null,
        status: 'idle',
        is_completed: false,
      })
      .select()
      .single();

    if (!error && data) {
      setShopping([data, ...shopping]);
      setNewShoppingName('');
      setNewShoppingUrl('');
      setNewShoppingPrice('');
      showToast(`Added ${data.item_name} to wishlist`);
    }
  };

  // Update shopping item status
  const updateShoppingStatus = async (id: string, status: 'idle' | 'selected' | 'reserved' | 'purchased') => {
    const item = shopping.find(i => i.id === id);
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setShopping(items =>
        items.map(i => (i.id === id ? { ...i, status } : i))
      );

      if (item) {
        const statusLabels = { idle: 'Unmarked', selected: 'Selected', reserved: 'Reserved', purchased: 'Purchased' };
        showToast(`${item.item_name} marked as ${statusLabels[status]}`);
      }
    }
  };

  // Start editing shopping item
  const startEditingShoppingItem = (item: ShoppingItem) => {
    setEditingItemId(item.id);
    setEditingItem({ ...item });
  };

  // Save edited shopping item
  const saveEditedShoppingItem = async () => {
    if (!editingItemId) return;

    const { error } = await supabase
      .from('shopping_list_items')
      .update({
        item_name: editingItem.item_name,
        url: editingItem.url || null,
        price: editingItem.price || null,
        brand: editingItem.brand || null,
        size: editingItem.size || null,
        notes: editingItem.notes || null,
        reserved_by: editingItem.reserved_by || null,
      })
      .eq('id', editingItemId);

    if (!error) {
      setShopping(items =>
        items.map(item => (item.id === editingItemId ? { ...item, ...editingItem } : item))
      );
      showToast('Item updated');
    }

    setEditingItemId(null);
    setEditingItem({});
  };

  // Delete shopping item
  const deleteShoppingItem = async (id: string) => {
    const item = shopping.find(i => i.id === id);
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setShopping(items => items.filter(i => i.id !== id));
      if (item) showToast(`Deleted ${item.item_name}`);
    }
  };

  // Sort shopping items
  const sortedShopping = [...shopping].sort((a, b) => {
    const order = { selected: 0, idle: 1, reserved: 2, purchased: 3 };
    const byStatus = order[a.status] - order[b.status];
    if (byStatus !== 0) return byStatus;
    return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
  });

  // Split into active and completed
  const activeShopping = sortedShopping.filter(item => item.status !== 'purchased');
  const completedShopping = sortedShopping.filter(item => item.status === 'purchased');

  // Filter inventory items
  const filteredInventory = inventory.filter(item => {
    if (filter === 'needs') return item.state === 'need_it';
    if (filter === 'hidden') return item.state === 'hidden';
    if (filter === 'next_size') return item.next_size_up;
    if (filter === 'completed') return item.state === 'dont_need_it';
    return item.state !== 'hidden'; // 'all' excludes hidden by default
  });

  // Get items by category
  const getItemsByCategory = (categoryId: string) => {
    return filteredInventory.filter(item => item.category === categoryId);
  };

  // Get state display
  const getInventoryStateDisplay = (state: string) => {
    switch (state) {
      case 'need_it':
        return { icon: CheckCircleIcon, color: 'text-green-600 bg-green-50 border-green-200', label: 'Need' };
      case 'dont_need_it':
        return { icon: XCircleIcon, color: 'text-gray-400 bg-gray-50 border-gray-200', label: "Don't Need" };
      case 'hidden':
        return { icon: EyeSlashIcon, color: 'text-gray-300 bg-gray-50 border-gray-200', label: 'Hide' };
      default:
        return { icon: CheckCircleIcon, color: 'text-green-600 bg-green-50 border-green-200', label: 'Need' };
    }
  };

  // Counts
  const needsCount = inventory.filter(i => i.state === 'need_it').length;
  const hiddenCount = inventory.filter(i => i.state === 'hidden').length;
  const nextSizeCount = inventory.filter(i => i.next_size_up).length;
  const completedInventoryCount = inventory.filter(i => i.state === 'dont_need_it').length;

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg">
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* LEFT PANEL: Profile with Editable Sizes */}
        <div className="col-span-3 space-y-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-sand p-6 sticky top-0">
            <div className="text-center mb-4">
              {child.photo_url ? (
                <img
                  src={child.photo_url}
                  alt={child.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4"
                  style={{ borderColor: child.label_color || '#d4a574' }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: child.label_color || '#d4a574' }}
                >
                  {child.name[0]}
                </div>
              )}
              <h2 className="text-xl font-serif text-gray-900">{child.name}</h2>
              {child.birthdate && (
                <p className="text-sm text-gray-500">
                  {new Date().getFullYear() - new Date(child.birthdate).getFullYear()} years old
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-sand pb-2">
                <h3 className="text-sm font-semibold text-gray-700">Sizes</h3>
                <p className="text-xs text-gray-500">Tap to edit</p>
              </div>

              {/* Shoe Size */}
              <div className="flex justify-between items-center text-sm group">
                <span className="text-gray-600">Shoes</span>
                {editingSizeField === 'shoe_size' ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editingSizeValue}
                      onChange={(e) => setEditingSizeValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveSizeEdit();
                        if (e.key === 'Escape') cancelSizeEdit();
                      }}
                      className="w-16 px-2 py-1 text-sm border border-sage rounded focus:outline-none focus:ring-2 focus:ring-sage"
                      autoFocus
                    />
                    <button onClick={saveSizeEdit} className="text-green-600 hover:text-green-700">
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button onClick={cancelSizeEdit} className="text-red-600 hover:text-red-700">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditingSize('shoe_size', sizes?.shoe_size || null)}
                    className="flex items-center gap-1 hover:bg-cream px-2 py-1 rounded transition-colors"
                  >
                    <span className="font-medium">{sizes?.shoe_size || '—'}</span>
                    <PencilIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                  </button>
                )}
              </div>

              {/* Pants Size */}
              <div className="flex justify-between items-center text-sm group">
                <span className="text-gray-600">Pants</span>
                {editingSizeField === 'pants_size' ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editingSizeValue}
                      onChange={(e) => setEditingSizeValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveSizeEdit();
                        if (e.key === 'Escape') cancelSizeEdit();
                      }}
                      className="w-16 px-2 py-1 text-sm border border-sage rounded focus:outline-none focus:ring-2 focus:ring-sage"
                      autoFocus
                    />
                    <button onClick={saveSizeEdit} className="text-green-600 hover:text-green-700">
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button onClick={cancelSizeEdit} className="text-red-600 hover:text-red-700">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditingSize('pants_size', sizes?.pants_size || null)}
                    className="flex items-center gap-1 hover:bg-cream px-2 py-1 rounded transition-colors"
                  >
                    <span className="font-medium">{sizes?.pants_size || '—'}</span>
                    <PencilIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                  </button>
                )}
              </div>

              {/* Shirt Size */}
              <div className="flex justify-between items-center text-sm group">
                <span className="text-gray-600">Shirt</span>
                {editingSizeField === 'shirt_size' ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editingSizeValue}
                      onChange={(e) => setEditingSizeValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveSizeEdit();
                        if (e.key === 'Escape') cancelSizeEdit();
                      }}
                      className="w-16 px-2 py-1 text-sm border border-sage rounded focus:outline-none focus:ring-2 focus:ring-sage"
                      autoFocus
                    />
                    <button onClick={saveSizeEdit} className="text-green-600 hover:text-green-700">
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button onClick={cancelSizeEdit} className="text-red-600 hover:text-red-700">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditingSize('shirt_size', sizes?.shirt_size || null)}
                    className="flex items-center gap-1 hover:bg-cream px-2 py-1 rounded transition-colors"
                  >
                    <span className="font-medium">{sizes?.shirt_size || '—'}</span>
                    <PencilIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                  </button>
                )}
              </div>
            </div>

            {sizes?.favorite_colors && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-1">Favorite Colors</h3>
                <p className="text-sm text-gray-600">{sizes.favorite_colors}</p>
              </div>
            )}

            {sizes?.favorite_brands && (
              <div className="mt-3">
                <h3 className="text-xs font-semibold text-gray-700 mb-1">Favorite Brands</h3>
                <p className="text-sm text-gray-600">{sizes.favorite_brands}</p>
              </div>
            )}

            {sizes?.notes && (
              <div className="mt-3">
                <h3 className="text-xs font-semibold text-gray-700 mb-1">Notes</h3>
                <p className="text-xs text-gray-600 italic">{sizes.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL: Inventory */}
        <div className="col-span-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-sand p-6">
            {/* Header with Filters */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif text-gray-900">Items & Needs</h2>
              </div>

              {/* Filter Buttons with Counts */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Show All
                </button>
                <button
                  onClick={() => setFilter('needs')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filter === 'needs'
                      ? 'bg-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Only Needs
                  <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                    {needsCount}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('next_size')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filter === 'next_size'
                      ? 'bg-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Next Size Up
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">
                    {nextSizeCount}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filter === 'completed'
                      ? 'bg-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed
                  <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                    {completedInventoryCount}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('hidden')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filter === 'hidden'
                      ? 'bg-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hidden
                  <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                    {hiddenCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Add Item Form */}
            <div className="mb-6 p-4 bg-cream rounded-xl">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add Item</h3>
              <div className="space-y-2">
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-sand rounded-lg focus:ring-2 focus:ring-sage outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addInventoryItem()}
                    placeholder="Item name"
                    className="col-span-2 px-3 py-2 text-sm border border-sand rounded-lg focus:ring-2 focus:ring-sage outline-none"
                  />
                  <input
                    type="text"
                    value={newItemSize}
                    onChange={(e) => setNewItemSize(e.target.value)}
                    placeholder="Size"
                    className="px-3 py-2 text-sm border border-sand rounded-lg focus:ring-2 focus:ring-sage outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value)}
                    placeholder="Brand (optional)"
                    className="flex-1 px-3 py-2 text-sm border border-sand rounded-lg focus:ring-2 focus:ring-sage outline-none"
                  />
                  <button
                    onClick={addInventoryItem}
                    disabled={!newItemName.trim()}
                    className="px-4 py-2 bg-sage text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              {CATEGORIES.map(category => {
                const items = getItemsByCategory(category.id);
                const isExpanded = expandedCategories.has(category.id);
                const linkedSize = category.id === 'shoes' ? sizes?.shoe_size : category.id === 'clothing' ? sizes?.shirt_size : null;

                return (
                  <div key={category.id} className="border border-sand rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-4 bg-cream hover:bg-sand transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-semibold text-gray-900">{category.name}</span>
                        {linkedSize && (
                          <span className="text-xs text-gray-500">• current {linkedSize}</span>
                        )}
                        <span className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-600">
                          {items.length}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="p-4 space-y-2 bg-white">
                        {items.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No items yet</p>
                        ) : (
                          items.map(item => {
                            const stateDisplay = getInventoryStateDisplay(item.state);
                            const StateIcon = stateDisplay.icon;

                            return (
                              <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors group ${
                                  item.state === 'need_it'
                                    ? 'border-sage bg-white'
                                    : item.state === 'dont_need_it'
                                    ? 'border-gray-200 bg-gray-50'
                                    : 'border-gray-200 bg-gray-50 opacity-60'
                                }`}
                              >
                                <button
                                  onClick={() => cycleItemState(item)}
                                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${stateDisplay.color}`}
                                  title={`Click to cycle state (currently: ${stateDisplay.label})`}
                                >
                                  <StateIcon className="w-5 h-5" />
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-2">
                                    <p className={`text-sm font-medium ${
                                      item.state === 'dont_need_it' ? 'line-through text-gray-400' : 'text-gray-900'
                                    }`}>
                                      {item.item_name}
                                    </p>
                                    {item.size && (
                                      <span className="text-xs text-gray-500">Size: {item.size}</span>
                                    )}
                                    {item.next_size_up && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                        Next Size ↑
                                      </span>
                                    )}
                                  </div>
                                  {item.brand && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <span>⭐</span> {item.brand}
                                    </p>
                                  )}
                                  {item.fit_notes && (
                                    <p className="text-xs text-gray-600 italic mt-1">{item.fit_notes}</p>
                                  )}
                                </div>

                                <button
                                  onClick={() => deleteInventoryItem(item.id)}
                                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1"
                                  title="Delete item"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Shopping/Wishlist */}
        <div className="col-span-3 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-sand p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-gray-900">Wishlist</h2>
              <button
                className="p-2 text-gray-600 hover:text-sage transition-colors"
                title="Export wishlist"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add Form */}
            <div className="mb-4 p-3 bg-cream rounded-xl space-y-2">
              <input
                type="text"
                value={newShoppingUrl}
                onChange={(e) => setNewShoppingUrl(e.target.value)}
                placeholder="Paste URL..."
                className="w-full px-3 py-2 text-xs border border-sand rounded-lg focus:ring-2 focus:ring-sage outline-none"
              />
              <input
                type="text"
                value={newShoppingName}
                onChange={(e) => setNewShoppingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addShoppingItem()}
                placeholder="Item name..."
                className="w-full px-3 py-2 text-xs border border-sand rounded-lg focus:ring-2 focus:ring-sage outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={newShoppingPrice}
                  onChange={(e) => setNewShoppingPrice(e.target.value)}
                  placeholder="Price"
                  className="flex-1 px-3 py-2 text-xs border border-sand rounded-lg focus:ring-2 focus:ring-sage outline-none"
                />
                <button
                  onClick={addShoppingItem}
                  disabled={!newShoppingName.trim() && !newShoppingUrl.trim()}
                  className="px-4 py-2 bg-sage text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Shopping Items */}
            <div className="space-y-2 mb-4">
              {activeShopping.map(item => (
                <div
                  key={item.id}
                  className={`rounded-lg border transition-colors group ${
                    item.status === 'selected'
                      ? 'border-sage bg-green-50'
                      : 'border-sand bg-white hover:border-sage'
                  }`}
                >
                  {editingItemId === item.id ? (
                    // Edit Mode
                    <div className="p-3 space-y-2">
                      <input
                        type="text"
                        value={editingItem.item_name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                        placeholder="Item name"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || null })}
                        className="w-full px-2 py-1 text-sm border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                        placeholder="Price"
                      />
                      <input
                        type="text"
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                        placeholder="URL"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={saveEditedShoppingItem}
                          className="px-3 py-1 bg-sage text-white rounded text-xs hover:bg-opacity-90"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingItemId(null);
                            setEditingItem({});
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-shrink-0 text-gray-400 cursor-move" title="Drag to reorder">
                          <Bars3Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 break-words">
                            {item.item_name}
                          </p>
                          {item.price && (
                            <p className="text-sm font-bold text-green-600">${item.price.toFixed(2)}</p>
                          )}
                          {item.brand && (
                            <p className="text-xs text-gray-500">{item.brand}</p>
                          )}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-sage hover:text-rose flex items-center gap-1 mt-1"
                            >
                              <LinkIcon className="w-3 h-3" />
                              View
                            </a>
                          )}
                          {item.reserved_by && (
                            <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                              <UserIcon className="w-3 h-3" />
                              Reserved by {item.reserved_by}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => updateShoppingStatus(item.id, item.status === 'selected' ? 'idle' : 'selected')}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                            item.status === 'selected'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title="Select this item"
                        >
                          {item.status === 'selected' ? (
                            <CheckCircleSolid className="w-3 h-3" />
                          ) : (
                            <CheckCircleIcon className="w-3 h-3" />
                          )}
                          Select
                        </button>
                        <button
                          onClick={() => updateShoppingStatus(item.id, 'purchased')}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          title="Mark as purchased"
                        >
                          <ShoppingBagIcon className="w-3 h-3" />
                          Buy
                        </button>
                        <button
                          onClick={() => startEditingShoppingItem(item)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          title="Edit item"
                        >
                          <PencilIcon className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteShoppingItem(item.id)}
                          className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete item"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeShopping.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No wishlist items yet</p>
              )}
            </div>

            {/* Completed Section */}
            {completedShopping.length > 0 && (
              <div className="border-t border-sand pt-4">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full flex items-center justify-between text-sm text-gray-600 mb-2 hover:text-gray-900"
                >
                  <span className="font-medium">Completed ({completedShopping.length})</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCompleted && (
                  <div className="space-y-2">
                    {completedShopping.map(item => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBagIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-gray-500 line-through flex-1">
                            {item.item_name}
                          </p>
                          <button
                            onClick={() => updateShoppingStatus(item.id, 'idle')}
                            className="text-xs text-gray-400 hover:text-sage"
                            title="Restore to active"
                          >
                            Undo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
