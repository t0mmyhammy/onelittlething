'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Star, ShoppingCart, UserPlus, Pencil, Check, X, Plus, DollarSign, ExternalLink, Image as ImageIcon, Trash2, Archive, MoreVertical, Lightbulb, ChevronDown, ChevronUp, Gift } from 'lucide-react';
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
  onDataChanged?: () => void;
}

type FilterType = 'active' | 'reserved' | 'purchased' | 'archived';

export default function WishlistTab({ childId, childName, shoppingItems, familyId, onDataChanged }: WishlistTabProps) {
  const supabase = createClient();
  const [filter, setFilter] = useState<FilterType>('active');
  const [items, setItems] = useState<ShoppingItem[]>(
    shoppingItems.map(item => ({
      ...item,
      status: item.is_completed ? 'purchased' : (item.status || 'idle'),
      archived: item.archived || false,
    }))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemName: string | null;
  }>({ isOpen: false, itemId: null, itemName: null });
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsId(null);
      }
    };

    if (showActionsId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showActionsId]);

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

  const handleCardClick = (itemId: string) => {
    if (editingId === itemId) return; // Don't expand/collapse while editing
    setExpandedId(expandedId === itemId ? null : itemId);
  };

  const handleDelete = async () => {
    if (!deleteConfirmModal.itemId) return;

    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', deleteConfirmModal.itemId);

    if (!error) {
      setItems(prev => prev.filter(item => item.id !== deleteConfirmModal.itemId));
      setShowActionsId(null);
      setDeleteConfirmModal({ isOpen: false, itemId: null, itemName: null });
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

  const handleMoveToIdeas = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const { data: { user } } = await supabase.auth.getUser();

    // Create entry in inventory_items (Ideas tab)
    const { error: insertError } = await supabase
      .from('inventory_items')
      .insert({
        child_id: childId,
        item_name: item.item_name,
        category: item.category || 'General',
        brand: item.brand || null,
        size: item.size || null,
        notes: item.notes || null,
        state: 'idea',
        next_size_up: false,
        created_by: user?.id,
      });

    if (!insertError) {
      // Archive the wishlist item
      const { error: archiveError } = await supabase
        .from('shopping_list_items')
        .update({ archived: true })
        .eq('id', itemId);

      if (!archiveError) {
        setItems(prev => prev.map(i =>
          i.id === itemId ? { ...i, archived: true } : i
        ));
        setShowActionsId(null);
        // Trigger data refresh in parent component
        if (onDataChanged) {
          onDataChanged();
        }
        // Show success feedback
        alert('Item moved to Ideas!');
      }
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

  const filterButtons: { id: FilterType; label: string; icon: string }[] = [
    { id: 'active', label: 'Active', icon: '📋' },
    { id: 'reserved', label: 'Reserved', icon: '🔖' },
    { id: 'purchased', label: 'Purchased', icon: '✅' },
    { id: 'archived', label: 'Archived', icon: '📦' },
  ];

  // Calculate counts for each filter
  const filterCounts = {
    active: sortedItems.filter(item => !item.archived && item.status !== 'reserved' && item.status !== 'purchased').length,
    reserved: sortedItems.filter(item => !item.archived && item.status === 'reserved').length,
    purchased: sortedItems.filter(item => !item.archived && item.status === 'purchased').length,
    archived: sortedItems.filter(item => item.archived).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[22px] font-semibold text-gray-900 mb-1">{childName}'s Wishlist</h2>
          <p className="text-[15px] text-gray-600 leading-relaxed">Gifts or planned purchases</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterButtons.map(btn => {
          const count = filterCounts[btn.id];
          return (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                filter === btn.id
                  ? 'bg-sage text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
              }`}
            >
              <span>{btn.icon}</span>
              <span>{btn.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === btn.id ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
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
      {shoppingItems.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-[#F0FDF4] to-white rounded-2xl border-2 border-dashed border-[#D1FAE5]">
          <div className="mb-4 inline-flex p-4 bg-white rounded-full shadow-sm">
            <Gift className="w-8 h-8 text-[#A7C4A0]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Move ideas from the Ideas tab to create your wishlist. Perfect for sharing with family and friends!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-[#A094F7]/10 flex items-center justify-center">
                <span className="text-[#A094F7] font-semibold">1</span>
              </div>
              <span>Create ideas</span>
            </div>
            <div className="hidden sm:block text-gray-300">→</div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-[#A7C4A0]/10 flex items-center justify-center">
                <span className="text-[#A7C4A0] font-semibold">2</span>
              </div>
              <span>Send to Wishlist</span>
            </div>
            <div className="hidden sm:block text-gray-300">→</div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-rose/10 flex items-center justify-center">
                <span className="text-rose font-semibold">3</span>
              </div>
              <span>Share with others</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
          const isSelected = item.status === 'selected';
          const isReserved = item.status === 'reserved';
          const isPurchased = item.status === 'purchased';
          const isReserving = reservingId === item.id;
          const isEditing = editingId === item.id;
          const showActions = showActionsId === item.id;
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`border-2 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden ${
                isSelected
                  ? 'border-sage ring-2 ring-sage/20'
                  : isPurchased
                  ? 'border-sand bg-gray-50'
                  : 'border-sand'
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
                /* View Mode - Collapsible */
                <>
                  {/* Main card - clickable to expand/collapse */}
                  <button
                    onClick={() => handleCardClick(item.id)}
                    className="w-full p-4 text-left"
                    disabled={isEditing}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Gift className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 text-lg">{item.item_name}</h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Price badge */}
                        {item.price && !isExpanded && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-semibold">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                        {/* Status badges */}
                        {isSelected && !isExpanded && (
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                        )}
                        {isReserved && !isExpanded && (
                          <UserPlus className="w-4 h-4 text-blue-500" />
                        )}
                        {isPurchased && !isExpanded && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                        {!isEditing && (
                          <>
                            {/* Delete Button - always visible */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmModal({
                                  isOpen: true,
                                  itemId: item.id,
                                  itemName: item.item_name
                                });
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {item.category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                          {item.category}
                        </span>
                      )}
                      {item.size && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          Size {item.size}
                        </span>
                      )}
                      {item.brand && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          {item.brand}
                        </span>
                      )}
                      {item.color && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          {item.color}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && !isEditing && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                      {/* Price and URL */}
                      <div className="pt-4 flex flex-wrap items-center gap-3">
                        {item.price && (
                          <div className="flex items-center gap-1 text-gray-900 font-bold text-lg">
                            <DollarSign className="w-5 h-5" />
                            {item.price.toFixed(2)}
                          </div>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-sage hover:text-rose font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                            View product
                          </a>
                        )}
                      </div>

                      {/* Notes */}
                      {item.notes && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Notes:</label>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.notes}</p>
                        </div>
                      )}

                      {/* Reserved/Purchased info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {item.reserved_at && (
                          <span>Reserved {new Date(item.reserved_at).toLocaleDateString()}</span>
                        )}
                        {item.reserved_by && (
                          <span>by {item.reserved_by}</span>
                        )}
                        {item.purchased_at && (
                          <span>Purchased {new Date(item.purchased_at).toLocaleDateString()}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!isPurchased && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(item.id);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-sage text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
                            {isSelected ? 'Selected' : 'Select'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuy(item.id);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-all"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Buy
                          </button>

                          {!isReserved && !isReserving && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReserve(item.id);
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all"
                            >
                              <UserPlus className="w-4 h-4" />
                              Reserve
                            </button>
                          )}

                          {/* Move to Ideas Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToIdeas(item.id);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-all"
                            title="Move to Ideas"
                          >
                            <Lightbulb className="w-4 h-4" />
                            Move to Ideas
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>

                          {isReserving && (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                value={reservedByInput}
                                onChange={(e) => setReservedByInput(e.target.value)}
                                placeholder="Reserved by..."
                                className="flex-1 px-3 py-2 border border-sand rounded-lg text-sm focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReserve(item.id);
                                }}
                                className="p-2 text-sage hover:bg-sage/10 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReservingId(null);
                                }}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {isReserved && item.reserved_by && (
                            <span className="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg flex items-center gap-1.5">
                              <UserPlus className="w-4 h-4" />
                              Reserved by {item.reserved_by}
                            </span>
                          )}
                        </div>
                      )}

                      {isPurchased && (
                        <div className="pt-2 flex items-center justify-between">
                          <div className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg inline-flex items-center gap-1.5">
                            <Check className="w-4 h-4" />
                            Purchased
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Move to Ideas Button - Visible in collapsed view */}
                  {!isExpanded && !isEditing && !isPurchased && (
                    <div className="px-4 pb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveToIdeas(item.id);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all"
                        title="Move to Ideas"
                      >
                        <Lightbulb className="w-4 h-4" />
                        Move to Ideas
                      </button>
                    </div>
                  )}

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
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setDeleteConfirmModal({ isOpen: false, itemId: null, itemName: null })}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-gray-900 mb-2">
              Delete Wishlist Item?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete <span className="font-semibold">{deleteConfirmModal.itemName}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false, itemId: null, itemName: null })}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
