'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus, Clock } from 'lucide-react';
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
  childSizes: any; // Legacy prop, not used anymore
  familyId: string;
}

// Grouped categories with emojis
const CATEGORY_GROUPS = {
  'Clothing': [
    { name: 'Pants', emoji: '👖' },
    { name: 'Shirts', emoji: '👕' },
    { name: 'Coat/Jacket', emoji: '🧥' },
    { name: 'Dress', emoji: '👗' },
    { name: 'Pajamas', emoji: '😴' },
  ],
  'Accessories': [
    { name: 'Shoes', emoji: '👟' },
    { name: 'Hat', emoji: '🧢' },
    { name: 'Gloves/Mittens', emoji: '🧤' },
    { name: 'Socks', emoji: '🧦' },
  ],
  'Essentials': [
    { name: 'Diapers', emoji: '🧷' },
    { name: 'Underwear', emoji: '🩲' },
    { name: 'Swimsuit', emoji: '🩱' },
  ],
  'Other': [
    { name: 'Other', emoji: '⭐' },
  ],
};

export default function SizesTab({ childId, childName, familyId }: SizesTabProps) {
  const supabase = createClient();
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
  const [isLoading, setIsLoading] = useState(true);
  const [sizeSelectionModal, setSizeSelectionModal] = useState<{
    isOpen: boolean;
    category: SizeCategory | null;
  }>({ isOpen: false, category: null });

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

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Remove this size category?')) return;

    const { error } = await supabase
      .from('child_size_categories')
      .delete()
      .eq('id', categoryId);

    if (!error) {
      await loadCategories();
    }
  };

  const handleAddToWishlist = (category: SizeCategory) => {
    setSizeSelectionModal({ isOpen: true, category });
  };

  const confirmAddToWishlist = async (selectedSize: 'current' | 'next') => {
    const category = sizeSelectionModal.category;
    if (!category) return;

    const size = selectedSize === 'current' ? category.current_size : category.next_size;
    const sizeLabel = selectedSize === 'current' ? 'Current' : 'Next';
    const itemName = `${category.category}${size ? ` - Size ${size}` : ' (size TBD)'}`;
    const notes = category.notes ? `${sizeLabel} size. ${category.notes}` : `${sizeLabel} size`;

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

  // Flatten all categories from CATEGORY_GROUPS
  const allCategoryNames = Object.values(CATEGORY_GROUPS).flat().map(cat => cat.name);

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
    for (const [_, items] of Object.entries(CATEGORY_GROUPS)) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-3xl font-serif text-gray-900">{childName}'s Sizes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {formatLastUpdated(lastUpdated)}
          </p>
        </div>
        {!isAddingCategory && (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="text-sage hover:text-rose transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        )}
      </div>

      {/* Add Category Modal */}
      {isAddingCategory && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Category</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CATEGORY_GROUPS).map(([groupName, items]) => (
                <div key={groupName} className="col-span-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{groupName}</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {items.map(item => {
                      const exists = categories.find(c => c.category === item.name);
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            if (!exists) {
                              setNewCategoryName(item.name);
                              handleAddCategory();
                            }
                          }}
                          disabled={!!exists}
                          className={`p-3 rounded-xl text-center transition-all ${
                            exists
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white shadow-sm hover:shadow-md hover:scale-105'
                          }`}
                        >
                          <div className="text-2xl mb-1">{item.emoji}</div>
                          <div className="text-xs font-medium text-gray-700">{item.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setIsAddingCategory(false)}
            className="w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Size Cards */}
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-2">No sizes tracked yet</p>
          <p className="text-sm text-gray-400">Tap Add to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => {
            const isEditing = editingId === category.id;
            const emoji = getCategoryEmoji(category.category);

            return (
              <div
                key={category.id}
                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 ${
                  isEditing ? 'ring-2 ring-sage' : ''
                }`}
              >
                {/* Category Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{emoji}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.category}</h3>
                      {category.updated_at && !isEditing && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Updated {formatTimestamp(category.updated_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => handleAddToWishlist(category)}
                      className="text-rose/60 hover:text-rose transition-colors p-2"
                      title="Add to wishlist"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Size Display/Edit */}
                {!isEditing ? (
                  <button
                    onClick={() => handleEdit(category)}
                    className="w-full text-left group"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current</p>
                        <p className="text-3xl font-bold text-gray-900 group-hover:text-sage transition-colors">
                          {category.current_size || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Next</p>
                        <p className="text-3xl font-bold text-gray-600 group-hover:text-sage transition-colors">
                          {category.next_size || '—'}
                        </p>
                      </div>
                    </div>
                    {category.notes && (
                      <p className="text-sm text-gray-500 mt-3 italic">{category.notes}</p>
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
                        onClick={() => handleDelete(category.id)}
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
          onClick={() => setSizeSelectionModal({ isOpen: false, category: null })}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-gray-900 mb-2">
              Add {sizeSelectionModal.category.category} to Wishlist
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Which size would you like to add?
            </p>

            <div className="space-y-3">
              {/* Current Size Option */}
              <button
                onClick={() => confirmAddToWishlist('current')}
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
                onClick={() => confirmAddToWishlist('next')}
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
              onClick={() => setSizeSelectionModal({ isOpen: false, category: null })}
              className="w-full mt-4 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
