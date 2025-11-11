'use client';

import { useState, useMemo } from 'react';
import { Star, ShoppingCart, UserPlus, Pencil, Check, X, Plus, DollarSign, ExternalLink, Image as ImageIcon, Trash2, Archive, MoreVertical } from 'lucide-react';
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
  archived?: boolean;
  reserved_at?: string | null;
  purchased_at?: string | null;
}

interface WishlistTabProps {
  childId: string;
  childName: string;
  shoppingItems: ShoppingItem[];
  familyId: string;
}

type FilterType = 'active' | 'reserved' | 'purchased' | 'archived';

export default function WishlistTab({ childId, childName, shoppingItems, familyId }: WishlistTabProps) {
  const supabase = createClient();
  const [filter, setFilter] = useState<FilterType>('active');
  const [items, setItems] = useState<ShoppingItem[]>(
    shoppingItems.map(item => ({
      ...item,
      status: item.is_completed ? 'purchased' : (item.status || 'idle'),
      archived: item.archived || false,
    }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{
    item_name: string;
    url: string;
    price: string;
    notes: string;
    brand: string;
    size: string;
    color: string;
    status: 'idle' | 'selected' | 'reserved' | 'purchased';
    reserved_by: string;
  }>({
    item_name: '',
    url: '',
    price: '',
    notes: '',
    brand: '',
    size: '',
    color: '',
    status: 'idle',
    reserved_by: '',
  });
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservedByInput, setReservedByInput] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [showActionsId, setShowActionsId] = useState<string | null>(null);

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
    if (filter === 'archived') {
      return sortedItems.filter(item => item.archived);
    }
    // Hide archived items from other views
    const nonArchived = sortedItems.filter(item => !item.archived);

    if (filter === 'active') {
      return nonArchived.filter(item => item.status !== 'reserved' && item.status !== 'purchased');
    } else if (filter === 'reserved') {
      return nonArchived.filter(item => item.status === 'reserved');
    } else if (filter === 'purchased') {
      return nonArchived.filter(item => item.status === 'purchased');
    }
    return nonArchived;
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

  const handleEdit = (item: ShoppingItem) => {
    setEditingId(item.id);
    setEditingValues({
      item_name: item.item_name,
      url: item.url || '',
      price: item.price?.toString() || '',
      notes: item.notes || '',
      brand: item.brand || '',
      size: item.size || '',
      color: item.color || '',
      status: item.status || 'idle',
      reserved_by: item.reserved_by || '',
    });
    setShowActionsId(null);
  };

  const handleSaveEdit = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    const now = new Date().toISOString();

    // Track status change dates
    const updateData: any = {
      item_name: editingValues.item_name,
      url: editingValues.url || null,
      price: editingValues.price ? parseFloat(editingValues.price) : null,
      notes: editingValues.notes || null,
      brand: editingValues.brand || null,
      size: editingValues.size || null,
      color: editingValues.color || null,
      status: editingValues.status,
      reserved_by: editingValues.reserved_by || null,
      is_completed: editingValues.status === 'purchased',
    };

    // Set reserved_at if status changed to reserved
    if (editingValues.status === 'reserved' && item?.status !== 'reserved') {
      updateData.reserved_at = now;
    }

    // Set purchased_at if status changed to purchased
    if (editingValues.status === 'purchased' && item?.status !== 'purchased') {
      updateData.purchased_at = now;
    }

    const { error } = await supabase
      .from('shopping_list_items')
      .update(updateData)
      .eq('id', itemId);

    if (!error) {
      setItems(prev => prev.map(item =>
        item.id === itemId ? {
          ...item,
          ...updateData,
          price: updateData.price,
        } : item
      ));
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValues({
      item_name: '',
      url: '',
      price: '',
      notes: '',
      brand: '',
      size: '',
      color: '',
      status: 'idle',
      reserved_by: '',
    });
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this item permanently?')) return;

    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setItems(prev => prev.filter(item => item.id !== itemId));
      setShowActionsId(null);
    }
  };

  const handleArchive = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    const newArchivedState = !item?.archived;

    const { error } = await supabase
      .from('shopping_list_items')
      .update({ archived: newArchivedState })
      .eq('id', itemId);

    if (!error) {
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, archived: newArchivedState } : item
      ));
      setShowActionsId(null);
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
        status: 'idle',
        archived: false,
      })
      .select()
      .single();

    if (!error && data) {
      setItems(prev => [...prev, { ...data, status: 'idle', archived: false }]);
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
    { id: 'archived', label: 'Archived' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{childName}'s Wishlist</h2>
          <p className="text-sm text-gray-600 mt-1">Gifts or planned purchases</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {filterButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === btn.id
                ? 'bg-sage text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Add Item Form */}
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
          const isEditing = editingId === item.id;
          const showActions = showActionsId === item.id;

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
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Edit Item</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="text-sage hover:text-sage/80 p-1"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={editingValues.item_name}
                    onChange={(e) => setEditingValues({ ...editingValues, item_name: e.target.value })}
                    placeholder="Item name"
                    className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                  />
                  <input
                    type="url"
                    value={editingValues.url}
                    onChange={(e) => setEditingValues({ ...editingValues, url: e.target.value })}
                    placeholder="Product URL"
                    className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="0.01"
                      value={editingValues.price}
                      onChange={(e) => setEditingValues({ ...editingValues, price: e.target.value })}
                      placeholder="Price"
                      className="px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                    />
                    <input
                      type="text"
                      value={editingValues.brand}
                      onChange={(e) => setEditingValues({ ...editingValues, brand: e.target.value })}
                      placeholder="Brand"
                      className="px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editingValues.size}
                      onChange={(e) => setEditingValues({ ...editingValues, size: e.target.value })}
                      placeholder="Size"
                      className="px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                    />
                    <input
                      type="text"
                      value={editingValues.color}
                      onChange={(e) => setEditingValues({ ...editingValues, color: e.target.value })}
                      placeholder="Color"
                      className="px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                    />
                  </div>
                  <textarea
                    value={editingValues.notes}
                    onChange={(e) => setEditingValues({ ...editingValues, notes: e.target.value })}
                    placeholder="Notes"
                    rows={2}
                    className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Status</label>
                      <select
                        value={editingValues.status}
                        onChange={(e) => setEditingValues({ ...editingValues, status: e.target.value as 'idle' | 'selected' | 'reserved' | 'purchased' })}
                        className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                      >
                        <option value="idle">Idle</option>
                        <option value="selected">Selected</option>
                        <option value="reserved">Reserved</option>
                        <option value="purchased">Purchased</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Reserved By</label>
                      <input
                        type="text"
                        value={editingValues.reserved_by}
                        onChange={(e) => setEditingValues({ ...editingValues, reserved_by: e.target.value })}
                        placeholder="Person's name"
                        className="w-full px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <div className="flex gap-4">
                    {/* Thumbnail placeholder */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
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
                        <div className="flex items-center gap-2">
                          {item.price && (
                            <div className="flex items-center gap-1 text-gray-900 font-bold text-lg">
                              <DollarSign className="w-5 h-5" />
                              {item.price.toFixed(2)}
                            </div>
                          )}
                          {/* More Actions Menu */}
                          {!isPurchased && !isEditing && (
                            <div className="relative">
                              <button
                                onClick={() => setShowActionsId(showActions ? null : item.id)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {showActions && (
                                <div className="absolute right-0 mt-1 bg-white border border-sand rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Pencil className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleArchive(item.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Archive className="w-4 h-4" />
                                    {item.archived ? 'Unarchive' : 'Archive'}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-sm text-gray-600 mb-3">{item.notes}</p>
                      )}

                      <div className="flex items-center gap-4 mb-3">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-sage hover:text-rose font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View product
                          </a>
                        )}
                        {item.reserved_at && (
                          <span className="text-xs text-gray-500">
                            Reserved {new Date(item.reserved_at).toLocaleDateString()}
                          </span>
                        )}
                        {item.purchased_at && (
                          <span className="text-xs text-gray-500">
                            Purchased {new Date(item.purchased_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!isPurchased && !isEditing && (
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
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                value={reservedByInput}
                                onChange={(e) => setReservedByInput(e.target.value)}
                                placeholder="Reserved by..."
                                className="flex-1 px-3 py-1.5 border border-sand rounded-lg text-sm focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
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
                        <div className="mt-3 flex items-center justify-between">
                          <div className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg inline-flex items-center gap-1.5">
                            <Check className="w-4 h-4" />
                            Purchased
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => setShowActionsId(showActions ? null : item.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {showActions && (
                              <div className="absolute right-0 mt-1 bg-white border border-sand rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleArchive(item.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Archive className="w-4 h-4" />
                                  {item.archived ? 'Unarchive' : 'Archive'}
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items in this section</p>
          </div>
        )}
      </div>
    </div>
  );
}
