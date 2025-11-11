'use client';

import { useState, useMemo } from 'react';
import { Star, ShoppingCart, UserPlus, Pencil, Check, X, Plus, DollarSign, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
  status?: 'idle' | 'selected' | 'reserved' | 'purchased';
  reserved_by?: string | null;
}

interface WishlistTabProps {
  childId: string;
  childName: string;
  shoppingItems: ShoppingItem[];
  familyId: string;
}

type FilterType = 'active' | 'reserved' | 'purchased';

export default function WishlistTab({ childId, childName, shoppingItems, familyId }: WishlistTabProps) {
  const supabase = createClient();
  const [filter, setFilter] = useState<FilterType>('active');
  const [items, setItems] = useState<ShoppingItem[]>(
    shoppingItems.map(item => ({
      ...item,
      status: item.is_completed ? 'purchased' : (item.status || 'idle'),
    }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservedByInput, setReservedByInput] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  // Sort items by status
  const sortedItems = useMemo(() => {
    const statusOrder = { selected: 0, idle: 1, reserved: 2, purchased: 3 };
    return [...items].sort((a, b) => {
      const statusA = a.status || 'idle';
      const statusB = b.status || 'idle';
      return statusOrder[statusA] - statusOrder[statusB];
    });
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (filter === 'active') {
      return sortedItems.filter(item => item.status !== 'reserved' && item.status !== 'purchased');
    } else if (filter === 'reserved') {
      return sortedItems.filter(item => item.status === 'reserved');
    } else {
      return sortedItems.filter(item => item.status === 'purchased');
    }
  }, [sortedItems, filter]);

  const updateStatus = async (itemId: string, newStatus: 'idle' | 'selected' | 'reserved' | 'purchased') => {
    await supabase
      .from('shopping_list_items')
      .update({
        status: newStatus,
        is_completed: newStatus === 'purchased'
      })
      .eq('id', itemId);

    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
  };

  const handleSelect = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    const newStatus = item?.status === 'selected' ? 'idle' : 'selected';
    updateStatus(itemId, newStatus);
  };

  const handleBuy = (itemId: string) => {
    updateStatus(itemId, 'purchased');
  };

  const handleReserve = async (itemId: string) => {
    if (reservingId === itemId && reservedByInput) {
      await supabase
        .from('shopping_list_items')
        .update({
          status: 'reserved',
          reserved_by: reservedByInput
        })
        .eq('id', itemId);

      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: 'reserved', reserved_by: reservedByInput } : item
      ));

      setReservingId(null);
      setReservedByInput('');
    } else {
      setReservingId(itemId);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert({
        child_id: childId,
        family_id: familyId,
        item_name: newItemName.trim(),
        url: newItemUrl.trim() || null,
        price: newItemPrice ? parseFloat(newItemPrice) : null,
        notes: newItemNotes.trim() || null,
        is_completed: false,
        status: 'idle'
      })
      .select()
      .single();

    if (!error && data) {
      setItems(prev => [...prev, { ...data, status: 'idle' }]);
      setNewItemName('');
      setNewItemUrl('');
      setNewItemPrice('');
      setNewItemNotes('');
      setIsAddingItem(false);
    }
  };

  const filterButtons: { id: FilterType; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'reserved', label: 'Reserved' },
    { id: 'purchased', label: 'Purchased' },
  ];

  const getThumbnail = (item: ShoppingItem) => {
    if (item.url) {
      // Simple heuristic to extract image from URL
      return item.url.includes('amazon.com') || item.url.includes('target.com')
        ? '/placeholder-product.png'
        : null;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{childName}'s Wishlist</h2>
          <p className="text-sm text-gray-600 mt-1">Gifts or planned purchases</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filterButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === btn.id
                ? 'bg-sage text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Add Item Form (Pinned at top) */}
      <div className="border-2 border-dashed border-sand rounded-xl p-5 hover:border-sage transition-colors">
        {!isAddingItem ? (
          <button
            onClick={() => setIsAddingItem(true)}
            className="flex items-center gap-2 text-sage hover:text-rose font-medium"
          >
            <Plus className="w-5 h-5" />
            Add wishlist item
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Add New Item</h3>
              <button
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemName('');
                  setNewItemUrl('');
                  setNewItemPrice('');
                  setNewItemNotes('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name *"
              className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              autoFocus
            />
            <input
              type="url"
              value={newItemUrl}
              onChange={(e) => setNewItemUrl(e.target.value)}
              placeholder="Product URL (optional)"
              className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
            />
            <input
              type="number"
              step="0.01"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              placeholder="Price (optional)"
              className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
            />
            <textarea
              value={newItemNotes}
              onChange={(e) => setNewItemNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemName('');
                  setNewItemUrl('');
                  setNewItemPrice('');
                  setNewItemNotes('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="px-4 py-2 text-sm font-medium bg-sage text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          const isSelected = item.status === 'selected';
          const isReserved = item.status === 'reserved';
          const isPurchased = item.status === 'purchased';
          const isReserving = reservingId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-5 transition-all ${
                isSelected
                  ? 'border-sage ring-2 ring-sage/20'
                  : isPurchased
                  ? 'border-sand bg-gray-50 opacity-75'
                  : 'border-sand hover:border-sage hover:shadow-sm'
              }`}
            >
              <div className="flex gap-4">
                {/* Thumbnail placeholder */}
                <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {getThumbnail(item) ? (
                    <img src={getThumbnail(item)!} alt={item.item_name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.brand && (
                          <span className="text-sm text-gray-600">{item.brand}</span>
                        )}
                        {item.size && (
                          <span className="px-2 py-0.5 bg-sand text-gray-700 text-xs rounded-full">
                            Size {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="px-2 py-0.5 bg-sand text-gray-700 text-xs rounded-full">
                            {item.color}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.price && (
                      <div className="flex items-center gap-1 text-gray-700 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {item.price.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-sm text-gray-600 mb-3">{item.notes}</p>
                  )}

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sage hover:text-rose mb-3"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      View product
                    </a>
                  )}

                  {/* Action Buttons */}
                  {!isPurchased && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <button
                        onClick={() => handleSelect(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          isSelected
                            ? 'bg-sage text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
                        {isSelected ? 'Selected' : 'Select'}
                      </button>

                      <button
                        onClick={() => handleBuy(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-all whitespace-nowrap"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy
                      </button>

                      {!isReserved && !isReserving && (
                        <button
                          onClick={() => handleReserve(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all whitespace-nowrap"
                        >
                          <UserPlus className="w-4 h-4" />
                          Reserve
                        </button>
                      )}

                      {isReserving && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={reservedByInput}
                            onChange={(e) => setReservedByInput(e.target.value)}
                            placeholder="Reserved by..."
                            className="px-3 py-1.5 border border-sand rounded-lg text-sm focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                          />
                          <button
                            onClick={() => handleReserve(item.id)}
                            className="p-1.5 text-sage hover:bg-sage/10 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setReservingId(null)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {isReserved && item.reserved_by && (
                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg flex items-center gap-1.5">
                          <UserPlus className="w-4 h-4" />
                          Reserved by {item.reserved_by}
                        </span>
                      )}
                    </div>
                  )}

                  {isPurchased && (
                    <div className="mt-3 px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Purchased
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items in this section</p>
          </div>
        )}
      </div>

      {/* Completed Section */}
      {filter === 'active' && items.filter(i => i.status === 'purchased').length > 0 && (
        <div className="pt-6 border-t border-sand">
          <h3 className="text-lg font-serif text-gray-900 mb-4">Completed</h3>
          <p className="text-sm text-gray-500">{items.filter(i => i.status === 'purchased').length} items purchased</p>
        </div>
      )}
    </div>
  );
}
