'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, DocumentArrowDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  photo_url: string | null;
  label_color: string | null;
}

interface ChildSize {
  id?: string;
  child_id: string;
  shoe_size: string | null;
  pants_size: string | null;
  shirt_size: string | null;
  notes: string | null;
  favorite_colors: string | null;
  favorite_styles: string | null;
  favorite_brands: string | null;
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
}

interface SizesPageClientProps {
  children: Child[];
  initialSizes: ChildSize[];
  initialShoppingItems: ShoppingItem[];
  familyId: string;
}

export default function SizesPageClient({
  children,
  initialSizes,
  initialShoppingItems,
  familyId,
}: SizesPageClientProps) {
  const [sizes, setSizes] = useState<Record<string, ChildSize>>(
    initialSizes.reduce((acc, size) => ({ ...acc, [size.child_id]: size }), {})
  );
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(initialShoppingItems);
  const [selectedChild, setSelectedChild] = useState<string | null>(children[0]?.id || null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemColor, setNewItemColor] = useState('');
  const [newItemSize, setNewItemSize] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ShoppingItem>>({});
  const supabase = createClient();

  // Get current child's sizes
  const currentSizes = selectedChild ? (sizes[selectedChild] || {
    child_id: selectedChild,
    shoe_size: null,
    pants_size: null,
    shirt_size: null,
    notes: null,
    favorite_colors: null,
    favorite_styles: null,
    favorite_brands: null,
  }) : null;

  // Update size field
  const updateSizeField = async (field: keyof ChildSize, value: string) => {
    if (!selectedChild) return;

    const updatedSizes = {
      ...sizes,
      [selectedChild]: {
        ...currentSizes!,
        [field]: value || null,
      },
    };

    setSizes(updatedSizes);

    // Upsert to database
    const { error } = await supabase
      .from('child_sizes')
      .upsert({
        child_id: selectedChild,
        [field]: value || null,
      }, {
        onConflict: 'child_id'
      });

    if (error) {
      console.error('Error updating size:', error);
    }
  };

  // Fetch title from URL
  const fetchTitleFromUrl = async (url: string) => {
    if (!url.trim()) return;

    try {
      setIsLoadingTitle(true);
      const response = await fetch(`/api/fetch-title?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.title && !newItemName) {
          setNewItemName(data.title);
        }
      }
    } catch (error) {
      console.error('Error fetching title:', error);
    } finally {
      setIsLoadingTitle(false);
    }
  };

  // Handle URL paste/change
  const handleUrlChange = (url: string) => {
    setNewItemUrl(url);

    // Try to detect if it's a URL
    if (url.match(/^https?:\/\/.+/)) {
      fetchTitleFromUrl(url);
    }
  };

  // Add shopping item
  const addShoppingItem = async () => {
    if ((!newItemName.trim() && !newItemUrl.trim()) || !selectedChild) return;

    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert({
        child_id: selectedChild,
        family_id: familyId,
        item_name: newItemName.trim() || 'Unnamed Item',
        category: newItemCategory || null,
        url: newItemUrl || null,
        color: newItemColor || null,
        size: newItemSize || null,
        brand: newItemBrand || null,
        price: newItemPrice ? parseFloat(newItemPrice) : null,
        is_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
      return;
    }

    setShoppingItems([data, ...shoppingItems]);
    setNewItemName('');
    setNewItemUrl('');
    setNewItemColor('');
    setNewItemSize('');
    setNewItemBrand('');
    setNewItemPrice('');
    setNewItemCategory('');
  };

  // Start editing an item
  const startEditingItem = (item: ShoppingItem) => {
    setEditingItemId(item.id);
    setEditingItem({ ...item });
  };

  // Cancel editing
  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditingItem({});
  };

  // Save edited item
  const saveEditedItem = async () => {
    if (!editingItemId) return;

    const { error } = await supabase
      .from('shopping_list_items')
      .update({
        item_name: editingItem.item_name,
        category: editingItem.category || null,
        url: editingItem.url || null,
        color: editingItem.color || null,
        size: editingItem.size || null,
        brand: editingItem.brand || null,
        price: editingItem.price || null,
        notes: editingItem.notes || null,
      })
      .eq('id', editingItemId);

    if (error) {
      console.error('Error updating item:', error);
      return;
    }

    setShoppingItems(items =>
      items.map(item =>
        item.id === editingItemId ? { ...item, ...editingItem } : item
      )
    );
    setEditingItemId(null);
    setEditingItem({});
  };

  // Toggle item completion
  const toggleItemComplete = async (itemId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ is_completed: !isCompleted })
      .eq('id', itemId);

    if (error) {
      console.error('Error toggling item:', error);
      return;
    }

    setShoppingItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, is_completed: !isCompleted } : item
      )
    );
  };

  // Delete shopping item
  const deleteShoppingItem = async (itemId: string) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      return;
    }

    setShoppingItems(items => items.filter(item => item.id !== itemId));
  };

  // Export shopping list
  const exportShoppingList = () => {
    const selectedItems = shoppingItems.filter(item => item.is_completed);
    if (selectedItems.length === 0) {
      alert('Please check the items you need first!');
      return;
    }

    // Group by child
    const itemsByChild: Record<string, ShoppingItem[]> = {};
    selectedItems.forEach(item => {
      if (!itemsByChild[item.child_id]) {
        itemsByChild[item.child_id] = [];
      }
      itemsByChild[item.child_id].push(item);
    });

    let exportText = '🛍️ SHOPPING LIST\n\n';

    Object.entries(itemsByChild).forEach(([childId, items]) => {
      const child = children.find(c => c.id === childId);
      const childSizes = sizes[childId];

      if (!child) return;

      exportText += `${child.name.toUpperCase()}\n`;
      exportText += '━━━━━━━━━━━━━━━━━━━━\n';

      if (childSizes) {
        if (childSizes.shoe_size) exportText += `👟 Shoe: ${childSizes.shoe_size}\n`;
        if (childSizes.pants_size) exportText += `👖 Pants: ${childSizes.pants_size}\n`;
        if (childSizes.shirt_size) exportText += `👕 Shirt: ${childSizes.shirt_size}\n`;
        if (childSizes.favorite_colors) exportText += `🎨 Colors: ${childSizes.favorite_colors}\n`;
        if (childSizes.favorite_brands) exportText += `⭐ Brands: ${childSizes.favorite_brands}\n`;
        exportText += '\n';
      }

      exportText += 'NEEDED ITEMS:\n';
      items.forEach(item => {
        exportText += `☐ ${item.item_name}`;
        if (item.price) exportText += ` - $${item.price.toFixed(2)}`;
        if (item.category) exportText += ` (${item.category})`;
        if (item.color || item.size || item.brand) {
          exportText += '\n  ';
          const details = [];
          if (item.color) details.push(`Color: ${item.color}`);
          if (item.size) details.push(`Size: ${item.size}`);
          if (item.brand) details.push(`Brand: ${item.brand}`);
          exportText += details.join(' | ');
        }
        if (item.url) exportText += `\n  🔗 ${item.url}`;
        if (item.notes) exportText += `\n  📝 ${item.notes}`;
        exportText += '\n';
      });

      exportText += '\n';
    });

    // Copy to clipboard
    navigator.clipboard.writeText(exportText).then(() => {
      alert('Shopping list copied to clipboard!');
    });
  };

  const currentChild = children.find(c => c.id === selectedChild);

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sand p-8 text-center">
        <h2 className="text-xl font-serif text-gray-900 mb-2">No children yet</h2>
        <p className="text-gray-600 mb-4">Add a child from the settings page to get started.</p>
        <a href="/settings" className="text-sage hover:text-rose font-medium">
          Go to Settings →
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">Sizes & Shopping Needs</h1>
        <p className="text-gray-600">
          Track your children's sizes and create shopping lists to share with family
        </p>
      </div>

      {/* Child Selector */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedChild === child.id
                ? 'bg-sage text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-sand hover:border-sage'
            }`}
          >
            {child.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Size Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand p-6">
          <h2 className="text-xl font-serif text-gray-900 mb-4">
            {currentChild?.name}'s Sizes
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shoe Size
              </label>
              <input
                type="text"
                value={currentSizes?.shoe_size || ''}
                onChange={(e) => updateSizeField('shoe_size', e.target.value)}
                placeholder="e.g., 7, 8.5, etc."
                className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pants Size
              </label>
              <input
                type="text"
                value={currentSizes?.pants_size || ''}
                onChange={(e) => updateSizeField('pants_size', e.target.value)}
                placeholder="e.g., 4T, 5, 28x30, etc."
                className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shirt Size
              </label>
              <input
                type="text"
                value={currentSizes?.shirt_size || ''}
                onChange={(e) => updateSizeField('shirt_size', e.target.value)}
                placeholder="e.g., 5T, Small, Medium, etc."
                className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size Notes
              </label>
              <textarea
                value={currentSizes?.notes || ''}
                onChange={(e) => updateSizeField('notes', e.target.value)}
                placeholder="e.g., Runs small in Nike, prefers loose fit, etc."
                rows={2}
                className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="pt-4 border-t border-sand">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preferences</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Favorite Colors
                  </label>
                  <input
                    type="text"
                    value={currentSizes?.favorite_colors || ''}
                    onChange={(e) => updateSizeField('favorite_colors', e.target.value)}
                    placeholder="e.g., Blue, pink, rainbow"
                    className="w-full px-3 py-2 text-sm border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Favorite Styles
                  </label>
                  <input
                    type="text"
                    value={currentSizes?.favorite_styles || ''}
                    onChange={(e) => updateSizeField('favorite_styles', e.target.value)}
                    placeholder="e.g., Dinosaurs, princesses, athletic"
                    className="w-full px-3 py-2 text-sm border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Favorite Brands
                  </label>
                  <input
                    type="text"
                    value={currentSizes?.favorite_brands || ''}
                    onChange={(e) => updateSizeField('favorite_brands', e.target.value)}
                    placeholder="e.g., Carter's, Nike, Old Navy"
                    className="w-full px-3 py-2 text-sm border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shopping List */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif text-gray-900">
              Shopping List
            </h2>
            <button
              onClick={exportShoppingList}
              className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Add Item Form */}
          <div className="mb-4 pb-4 border-b border-sand bg-cream rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Item</h3>

            {/* URL Field */}
            <div className="mb-3">
              <input
                type="text"
                value={newItemUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Paste product URL (optional)..."
                className="w-full px-3 py-2 text-sm border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
              {isLoadingTitle && (
                <p className="text-xs text-gray-500 mt-1">Loading title...</p>
              )}
            </div>

            {/* Item Name Field */}
            <div className="mb-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
                placeholder="Item name..."
                className="w-full px-3 py-2 text-sm border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <input
                type="text"
                value={newItemColor}
                onChange={(e) => setNewItemColor(e.target.value)}
                placeholder="Color"
                className="px-3 py-2 text-xs border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
              <input
                type="text"
                value={newItemSize}
                onChange={(e) => setNewItemSize(e.target.value)}
                placeholder="Size"
                className="px-3 py-2 text-xs border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
              <input
                type="text"
                value={newItemBrand}
                onChange={(e) => setNewItemBrand(e.target.value)}
                placeholder="Brand"
                className="px-3 py-2 text-xs border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
              <input
                type="number"
                step="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="Price"
                className="px-3 py-2 text-xs border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
            </div>

            {/* Category Field */}
            <div className="mb-3">
              <input
                type="text"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                placeholder="Category (e.g., shoes, clothing, toys)"
                className="w-full px-3 py-2 text-xs border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={addShoppingItem}
              disabled={!newItemName.trim() && !newItemUrl.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sage text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {/* Shopping Items List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {shoppingItems
              .filter(item => item.child_id === selectedChild)
              .map((item) => {
                const isEditing = editingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border-2 border-sand group hover:border-sage transition-all shadow-sm"
                  >
                    <div className="flex items-start gap-3 p-4">
                      <button
                        onClick={() => toggleItemComplete(item.id, item.is_completed)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all mt-0.5 ${
                          item.is_completed
                            ? 'bg-sage border-sage'
                            : 'bg-white border-gray-300 hover:border-sage'
                        }`}
                      >
                        {item.is_completed && (
                          <CheckIcon className="w-full h-full text-white p-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          /* Edit Mode */
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingItem.item_name || ''}
                              onChange={(e) => setEditingItem({...editingItem, item_name: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                              placeholder="Item name"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={editingItem.color || ''}
                                onChange={(e) => setEditingItem({...editingItem, color: e.target.value})}
                                className="px-2 py-1 text-xs border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                                placeholder="Color"
                              />
                              <input
                                type="text"
                                value={editingItem.size || ''}
                                onChange={(e) => setEditingItem({...editingItem, size: e.target.value})}
                                className="px-2 py-1 text-xs border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                                placeholder="Size"
                              />
                              <input
                                type="text"
                                value={editingItem.brand || ''}
                                onChange={(e) => setEditingItem({...editingItem, brand: e.target.value})}
                                className="px-2 py-1 text-xs border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                                placeholder="Brand"
                              />
                              <input
                                type="number"
                                step="0.01"
                                value={editingItem.price || ''}
                                onChange={(e) => setEditingItem({...editingItem, price: e.target.value ? parseFloat(e.target.value) : null})}
                                className="px-2 py-1 text-xs border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                                placeholder="Price"
                              />
                            </div>
                            <input
                              type="text"
                              value={editingItem.url || ''}
                              onChange={(e) => setEditingItem({...editingItem, url: e.target.value})}
                              className="w-full px-2 py-1 text-xs border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                              placeholder="URL"
                            />
                            <input
                              type="text"
                              value={editingItem.category || ''}
                              onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                              className="w-full px-2 py-1 text-xs border border-sand rounded focus:ring-2 focus:ring-sage outline-none"
                              placeholder="Category"
                            />
                            <textarea
                              value={editingItem.notes || ''}
                              onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                              className="w-full px-2 py-1 text-xs border border-sand rounded focus:ring-2 focus:ring-sage outline-none resize-none"
                              placeholder="Notes"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={saveEditedItem}
                                className="flex-1 px-3 py-1.5 bg-sage text-white rounded text-xs font-medium hover:bg-opacity-90"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditingItem}
                                className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                  <h4 className={`text-sm font-semibold ${
                                    item.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                                  }`}>
                                    {item.item_name}
                                  </h4>
                                  {item.price && (
                                    <span className="text-sm font-bold text-sage">
                                      ${item.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                {item.category && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-sand text-xs text-gray-700 rounded-full">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditingItem(item)}
                                  className="p-1 text-gray-400 hover:text-sage transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteShoppingItem(item.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Details */}
                            {(item.color || item.size || item.brand) && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.color && (
                                  <span className="text-xs text-gray-600 bg-cream px-2 py-1 rounded">
                                    🎨 {item.color}
                                  </span>
                                )}
                                {item.size && (
                                  <span className="text-xs text-gray-600 bg-cream px-2 py-1 rounded">
                                    📏 {item.size}
                                  </span>
                                )}
                                {item.brand && (
                                  <span className="text-xs text-gray-600 bg-cream px-2 py-1 rounded">
                                    ⭐ {item.brand}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* URL */}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-xs text-sage hover:text-rose transition-colors"
                              >
                                🔗 View Product
                              </a>
                            )}

                            {/* Notes */}
                            {item.notes && (
                              <p className="text-xs text-gray-600 mt-2 italic border-l-2 border-sand pl-2">
                                {item.notes}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {shoppingItems.filter(item => item.child_id === selectedChild).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No items yet</p>
                <p className="text-xs mt-1">Add what {currentChild?.name} needs above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
