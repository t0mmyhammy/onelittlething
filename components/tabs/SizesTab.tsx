'use client';

import { useState, useEffect } from 'react';
import { Gift, Plus, Clock, Check, Lightbulb, Shirt, ShoppingBag, Sparkles, Star, CircleDot, Bed, Waves } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SizeCategory {
  id: string;
  category: string;
  current_size: string | null;
  next_size: string | null;
  notes: string | null;
  need_status: string | null;
  hide_from_sharing: boolean;
  updated_at: string;
  created_at: string;
}

interface SizesTabProps {
  childId: string;
  childName: string;
  childGender: string | null;
  childSizes: any; // Legacy prop, not used anymore
  familyId: string;
}

// Grouped categories with icons and gender filters
type CategoryItem = {
  name: string;
  emoji: string;
  gender: string | null;
};

type CategoryGroups = {
  [key: string]: CategoryItem[];
};

const CATEGORY_GROUPS: CategoryGroups = {
  'Clothing': [
    { name: 'Pants', emoji: '👖', gender: null },
    { name: 'Shirts', emoji: '👕', gender: null },
    { name: 'Coat/Jacket', emoji: '🧥', gender: null },
    { name: 'Dress', emoji: '👗', gender: 'girl' },
    { name: 'Pajamas', emoji: '🛏️', gender: null },
  ],
  'Accessories': [
    { name: 'Shoes', emoji: '👟', gender: null },
    { name: 'Hat', emoji: '🧢', gender: null },
    { name: 'Gloves/Mittens', emoji: '🧤', gender: null },
    { name: 'Socks', emoji: '🧦', gender: null },
  ],
  'Essentials': [
    { name: 'Diapers', emoji: '🧷', gender: null },
    { name: 'Underwear', emoji: '🩲', gender: null },
    { name: 'Swimsuit', emoji: '🏊', gender: null },
  ],
  'Other': [
    { name: 'Other', emoji: '⭐', gender: null },
  ],
};

// Filter categories based on gender
const getFilteredCategories = (childGender: string | null): CategoryGroups => {
  const filtered: CategoryGroups = {};

  for (const [group, items] of Object.entries(CATEGORY_GROUPS)) {
    filtered[group] = items.filter(item => {
      // If item has no gender restriction, include it
      if (!item.gender) return true;
      // If item has gender restriction, only include if it matches
      return item.gender === childGender;
    });
  }

  return filtered;
};

export default function SizesTab({ childId, childName, childGender, familyId }: SizesTabProps) {
  const supabase = createClient();

  // All state hooks at component level (never inside loops/maps)
  const [categories, setCategories] = useState<SizeCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{
    current: string;
    next: string;
    fitNotes: string;
    needStatus: string;
    hideFromSharing: boolean;
  }>({ current: '', next: '', fitNotes: '', needStatus: 'have_enough', hideFromSharing: false });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sizeSelectionModal, setSizeSelectionModal] = useState<{
    isOpen: boolean;
    category: SizeCategory | null;
  }>({ isOpen: false, category: null });
  const [wishlistCheckStates, setWishlistCheckStates] = useState<Record<string, boolean>>({});
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    categoryId: string | null;
    categoryName: string | null;
  }>({ isOpen: false, categoryId: null, categoryName: null });
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [actionType, setActionType] = useState<'wishlist' | 'ideas' | null>(null);

  useEffect(() => {
    loadCategories();
  }, [childId]);

  const loadCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('child_size_categories')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
    setIsLoading(false);
  };

  const handleSave = async (categoryId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('child_size_categories')
      .update({
        current_size: editingValues.current || null,
        next_size: editingValues.next || null,
        notes: editingValues.fitNotes || null,
        need_status: editingValues.needStatus,
        hide_from_sharing: editingValues.hideFromSharing,
        updated_at: new Date().toISOString(),
        modified_by: user?.id,
        modified_at: new Date().toISOString(),
      })
      .eq('id', categoryId);

    if (!error) {
      await loadCategories();
      setEditingId(null);
    }
  };

  const handleEdit = (category: SizeCategory) => {
    setEditingId(category.id);
    setEditingValues({
      current: category.current_size || '',
      next: category.next_size || '',
      fitNotes: category.notes || '',
      needStatus: category.need_status || 'have_enough',
      hideFromSharing: category.hide_from_sharing || false,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValues({ current: '', next: '', fitNotes: '', needStatus: 'have_enough', hideFromSharing: false });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const { error } = await supabase
      .from('child_size_categories')
      .insert({
        child_id: childId,
        category: newCategoryName.trim(),
        current_size: null,
        next_size: null,
      });

    if (!error) {
      await loadCategories();
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmModal.categoryId) return;

    const { error } = await supabase
      .from('child_size_categories')
      .delete()
      .eq('id', deleteConfirmModal.categoryId);

    if (!error) {
      await loadCategories();
      setDeleteConfirmModal({ isOpen: false, categoryId: null, categoryName: null });
    }
  };

  const handleAddCustomCategory = async () => {
    if (!customCategoryName.trim()) return;

    const { error } = await supabase
      .from('child_size_categories')
      .insert({
        child_id: childId,
        category: customCategoryName.trim(),
        current_size: null,
        next_size: null,
      });

    if (!error) {
      await loadCategories();
      setCustomCategoryName('');
      setShowCustomNameInput(false);
      setIsAddingCategory(false);
    }
  };

  const handleAddToWishlist = (category: SizeCategory) => {
    setActionType('wishlist');
    setSizeSelectionModal({ isOpen: true, category });
  };

  const handleAddToIdeas = (category: SizeCategory) => {
    setActionType('ideas');
    setSizeSelectionModal({ isOpen: true, category });
  };

  const confirmAction = async (selectedSize: 'current' | 'next') => {
    const category = sizeSelectionModal.category;
    if (!category || !actionType) return;

    const size = selectedSize === 'current' ? category.current_size : category.next_size;
    const sizeLabel = selectedSize === 'current' ? 'Current' : 'Next';
    const itemName = `${category.category}${size ? ` - Size ${size}` : ' (size TBD)'}`;
    const notes = category.notes ? `${sizeLabel} size. ${category.notes}` : `${sizeLabel} size`;

    if (actionType === 'wishlist') {
      const { error } = await supabase
        .from('shopping_list_items')
        .insert({
          child_id: childId,
          family_id: familyId,
          item_name: itemName,
          category: category.category,
          size: size || null,
          notes: notes,
          is_completed: false,
          status: 'idle',
          archived: false,
        });

      if (!error) {
        alert(`Added "${itemName}" to wishlist!`);
        setSizeSelectionModal({ isOpen: false, category: null });
        setActionType(null);
      }
    } else if (actionType === 'ideas') {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('inventory_items')
        .insert({
          child_id: childId,
          item_name: itemName,
          category: category.category,
          size: size || null,
          notes: notes,
          state: 'idea',
          next_size_up: false,
          created_by: user?.id,
        });

      if (!error) {
        alert(`Added "${itemName}" to ideas!`);
        setSizeSelectionModal({ isOpen: false, category: null });
        setActionType(null);
        // Optionally redirect to Ideas tab
        window.location.hash = 'ideas';
      }
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 90) return `${Math.floor(days / 30)} months ago`;
    return date.toLocaleDateString();
  };

  // Flatten all categories from CATEGORY_GROUPS (filtered by gender)
  const filteredGroups = getFilteredCategories(childGender);
  const allCategoryNames = Object.values(filteredGroups).flat().map(cat => cat.name);

  const availableCategories = allCategoryNames.filter(
    cat => !categories.find(c => c.category.toLowerCase() === cat.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading sizes...</div>
      </div>
    );
  }

  // Get category emoji
  const getCategoryEmoji = (categoryName: string) => {
    for (const [_, items] of Object.entries(filteredGroups)) {
      const found = items.find(item => item.name === categoryName);
      if (found) return found.emoji;
    }
    return '📦';
  };

  // Get most recent update time
  const lastUpdated = categories.length > 0
    ? categories.reduce((latest, cat) => {
        const catTime = new Date(cat.updated_at || cat.created_at).getTime();
        return catTime > latest ? catTime : latest;
      }, 0)
    : null;

  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Calculate contextual message
  const getContextualMessage = () => {
    if (categories.length === 0) {
      return `Start tracking ${childName}'s sizes — get notified when it's time to size up`;
    }
    if (!lastUpdated) {
      return `Track ${childName}'s growing sizes`;
    }
    const diffDays = Math.floor((Date.now() - lastUpdated) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      return `Time for a size check-up? It's been ${Math.floor(diffDays / 30)} months!`;
    }
    return `Track ${childName}'s growing sizes — automatically reminds you when it's time to size up`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[22px] font-semibold text-gray-900 mb-1.5">{childName}'s Sizes</h2>
          <p className="text-[15px] text-gray-600 leading-relaxed">
            {getContextualMessage()}
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1.5">
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </div>
        {!isAddingCategory && (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="px-4 py-2.5 bg-sage text-white rounded-xl hover:opacity-90 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        )}
      </div>

      {/* Add Category Modal */}
      {isAddingCategory && !showCustomNameInput && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Category</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(filteredGroups).map(([groupName, items]) => (
                <div key={groupName} className="col-span-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{groupName}</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {items.map(item => {
                      const exists = categories.find(c => c.category === item.name);
                      const isOther = item.name === 'Other';
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            if (!exists) {
                              if (isOther) {
                                // Show custom name input for "Other"
                                setShowCustomNameInput(true);
                                setCustomCategoryName('');
                              } else {
                                // Add predefined category immediately
                                setNewCategoryName(item.name);
                                handleAddCategory();
                              }
                            }
                          }}
                          disabled={!!exists}
                          className={`p-3 rounded-xl text-center transition-all ${
                            exists
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white shadow-sm hover:shadow-md hover:scale-105'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setIsAddingCategory(false);
              setShowCustomNameInput(false);
            }}
            className="w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Custom Category Name Input Modal */}
      {showCustomNameInput && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Name Your Category</h3>
          <p className="text-sm text-gray-600 mb-4">
            What type of clothing or accessory would you like to track?
          </p>
          <input
            type="text"
            value={customCategoryName}
            onChange={(e) => setCustomCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customCategoryName.trim()) {
                handleAddCustomCategory();
              }
            }}
            placeholder="e.g., Backpack, Belt, Scarf..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none mb-4"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={handleAddCustomCategory}
              disabled={!customCategoryName.trim()}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                customCategoryName.trim()
                  ? 'bg-sage text-white hover:opacity-90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Add Category
            </button>
            <button
              onClick={() => {
                setShowCustomNameInput(false);
                setCustomCategoryName('');
              }}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Size Cards */}
      {categories.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-sage/5 to-rose/5 rounded-2xl border-2 border-dashed border-sage/20">
          <div className="text-6xl mb-4">👕</div>
          <p className="text-lg font-medium text-gray-700 mb-2">No sizes added yet</p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Start with {childName}'s shoe size, pants, or favorite shirt — tap "Add Item" above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((category) => {
            const isEditing = editingId === category.id;
            const emoji = getCategoryEmoji(category.category);
            const showWishlistCheck = wishlistCheckStates[category.id] || false;

            return (
              <div
                key={category.id}
                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 px-5 py-4 ${
                  isEditing ? 'ring-2 ring-sage' : ''
                }`}
              >
                {/* Category Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[17px] font-semibold text-gray-900">{category.category}</h3>
                    {category.updated_at && !isEditing && (
                      <p className="text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatTimestamp(category.updated_at)}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      {/* Lightbulb - Add to Ideas */}
                      <button
                        onClick={() => handleAddToIdeas(category)}
                        className="text-yellow-500 hover:text-yellow-600 transition-all duration-200 p-2 hover:scale-110 relative group"
                        title="Add to ideas"
                      >
                        <Lightbulb className="w-5 h-5" />
                        <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Add to ideas
                        </span>
                      </button>
                      {/* Present - Add to Wishlist */}
                      <button
                        onClick={() => {
                          handleAddToWishlist(category);
                          setWishlistCheckStates(prev => ({ ...prev, [category.id]: true }));
                          setTimeout(() => {
                            setWishlistCheckStates(prev => ({ ...prev, [category.id]: false }));
                          }, 2000);
                        }}
                        className="text-rose hover:text-rose/80 transition-all duration-200 p-2 hover:scale-110 relative group"
                        title="Add to wishlist"
                      >
                        {showWishlistCheck ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Gift className="w-5 h-5" />
                        )}
                        <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Add to wishlist
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Size Display/Edit */}
                {!isEditing ? (
                  <button
                    onClick={() => handleEdit(category)}
                    className="w-full text-left group"
                  >
                    <div className="grid grid-cols-2 gap-6 items-center">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Current</p>
                        <p className="text-[22px] font-semibold text-gray-800 group-hover:text-sage transition-all duration-200">
                          {category.current_size || '—'}
                        </p>
                      </div>
                      <div className="border-l border-gray-100 pl-6">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Next</p>
                        <p className="text-[22px] font-semibold text-sage group-hover:opacity-90 transition-all duration-200">
                          {category.next_size || '—'}
                        </p>
                      </div>
                    </div>
                    {category.notes && (
                      <p className="text-sm text-gray-500 mt-4 leading-relaxed bg-gray-50 px-3 py-2.5 rounded-lg">{category.notes}</p>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Current</label>
                        <input
                          type="text"
                          value={editingValues.current}
                          onChange={(e) => setEditingValues({ ...editingValues, current: e.target.value })}
                          className="w-full text-2xl font-bold text-gray-900 bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sage"
                          placeholder="—"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Next</label>
                        <input
                          type="text"
                          value={editingValues.next}
                          onChange={(e) => setEditingValues({ ...editingValues, next: e.target.value })}
                          className="w-full text-2xl font-bold text-gray-600 bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sage"
                          placeholder="—"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editingValues.fitNotes}
                      onChange={(e) => setEditingValues({ ...editingValues, fitNotes: e.target.value })}
                      placeholder="Notes (optional)"
                      className="w-full text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sage"
                    />
                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={editingValues.hideFromSharing}
                        onChange={(e) => setEditingValues({ ...editingValues, hideFromSharing: e.target.checked })}
                        className="w-4 h-4 text-sage border-gray-300 rounded focus:ring-sage"
                      />
                      <span className="text-sm text-gray-600">Hide from sharing</span>
                    </label>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSave(category.id)}
                        className="flex-1 py-2 bg-sage text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setDeleteConfirmModal({
                          isOpen: true,
                          categoryId: category.id,
                          categoryName: category.category
                        })}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Size Selection Modal */}
      {sizeSelectionModal.isOpen && sizeSelectionModal.category && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setSizeSelectionModal({ isOpen: false, category: null });
            setActionType(null);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-gray-900 mb-2">
              Add {sizeSelectionModal.category.category} to {actionType === 'wishlist' ? 'Wishlist' : 'Ideas'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Which size would you like to add?
            </p>

            <div className="space-y-3">
              {/* Current Size Option */}
              <button
                onClick={() => confirmAction('current')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  sizeSelectionModal.category.current_size
                    ? 'border-sage hover:bg-sage/5 hover:shadow-md'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                disabled={!sizeSelectionModal.category.current_size}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">Current Size</span>
                  {!sizeSelectionModal.category.current_size && (
                    <span className="text-xs text-red-600 font-medium">Not set</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-sage">
                  {sizeSelectionModal.category.current_size || '—'}
                </div>
              </button>

              {/* Next Size Option */}
              <button
                onClick={() => confirmAction('next')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  sizeSelectionModal.category.next_size
                    ? 'border-blue-500 hover:bg-blue-50 hover:shadow-md'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                disabled={!sizeSelectionModal.category.next_size}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">Next Size Up</span>
                  {!sizeSelectionModal.category.next_size && (
                    <span className="text-xs text-red-600 font-medium">Not set</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {sizeSelectionModal.category.next_size || '—'}
                </div>
              </button>
            </div>

            {!sizeSelectionModal.category.current_size && !sizeSelectionModal.category.next_size && (
              <p className="text-xs text-gray-500 mt-4 text-center">
                Please set at least one size before adding to wishlist
              </p>
            )}

            <button
              onClick={() => {
                setSizeSelectionModal({ isOpen: false, category: null });
                setActionType(null);
              }}
              className="w-full mt-4 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setDeleteConfirmModal({ isOpen: false, categoryId: null, categoryName: null })}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-gray-900 mb-2">
              Remove Size Category?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-semibold">{deleteConfirmModal.categoryName}</span> from {childName}'s sizes? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false, categoryId: null, categoryName: null })}
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
