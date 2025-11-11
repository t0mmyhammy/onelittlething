'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, ShoppingBag, Plus, User, Trash2, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface IdeaItem {
  id: string;
  child_id: string;
  category: string;
  item_name: string;
  size: string | null;
  notes: string | null;
  brand: string | null;
  state: 'idea' | 'research';
  next_size_up: boolean;
  photo_url: string | null;
  created_by: string | null;
  created_at: string;
}

interface ChildSize {
  shoe_size: string | null;
  pants_size: string | null;
  shirt_size: string | null;
}

interface IdeasTabProps {
  childId: string;
  childName: string;
  inventoryItems: IdeaItem[];
  childSizes: ChildSize | null;
  familyId: string;
  onSwitchToWishlist?: () => void;
}

export default function IdeasTab({ childId, childName, inventoryItems, childSizes, familyId, onSwitchToWishlist }: IdeasTabProps) {
  const supabase = createClient();
  const [items, setItems] = useState<IdeaItem[]>(inventoryItems);
  const [userEmail, setUserEmail] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<IdeaItem>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIdeaForm, setNewIdeaForm] = useState({
    item_name: '',
    category: '',
    brand: '',
    size: '',
    notes: '',
  });

  // Update items when child changes or inventoryItems prop changes
  useEffect(() => {
    setItems(inventoryItems);
  }, [inventoryItems, childId]);

  // Get current user email
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string) => {
    setToast(message);
  };

  const handleCardClick = (itemId: string) => {
    if (editingId === itemId) return; // Don't toggle if editing
    setExpandedId(expandedId === itemId ? null : itemId);
  };

  const handleEdit = (item: IdeaItem) => {
    setEditingId(item.id);
    setEditForm({
      item_name: item.item_name,
      brand: item.brand,
      size: item.size,
      notes: item.notes,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (itemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('inventory_items')
      .update({
        ...editForm,
        modified_by: user?.id,
        modified_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (!error) {
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...editForm } : item
      ));
      setEditingId(null);
      setEditForm({});
      showToast('Changes saved!');
    }
  };

  const handleAddToWishlist = async (item: IdeaItem) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .insert({
        child_id: childId,
        family_id: familyId,
        item_name: item.item_name,
        category: item.category,
        size: item.size,
        brand: item.brand,
        notes: item.notes,
        is_completed: false,
        status: 'idle',
        archived: false,
      });

    if (!error) {
      showToast(`Added "${item.item_name}" to wishlist!`);
      // Don't remove from ideas - keep it here
      // Call parent callback to switch to wishlist tab
      if (onSwitchToWishlist) {
        setTimeout(() => {
          onSwitchToWishlist();
        }, 1500);
      }
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this idea?')) return;

    await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);

    setItems(prev => prev.filter(i => i.id !== itemId));
    showToast('Idea deleted');
  };

  const handleAddNewIdea = async () => {
    if (!newIdeaForm.item_name.trim()) {
      alert('Please enter an item name');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        child_id: childId,
        item_name: newIdeaForm.item_name.trim(),
        category: newIdeaForm.category.trim() || 'General',
        brand: newIdeaForm.brand.trim() || null,
        size: newIdeaForm.size.trim() || null,
        notes: newIdeaForm.notes.trim() || null,
        state: 'idea',
        next_size_up: false,
        created_by: user?.id,
      })
      .select()
      .single();

    if (!error && data) {
      setItems(prev => [data, ...prev]);
      setNewIdeaForm({
        item_name: '',
        category: '',
        brand: '',
        size: '',
        notes: '',
      });
      setIsAddingNew(false);
      showToast('Idea added!');
    }
  };

  const handleCancelNewIdea = () => {
    setIsAddingNew(false);
    setNewIdeaForm({
      item_name: '',
      category: '',
      brand: '',
      size: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-sage text-white animate-fadeSlideIn">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{childName}'s Ideas</h2>
          <p className="text-sm text-gray-600 mt-1">Click any card to expand and edit details</p>
        </div>
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Idea
          </button>
        )}
      </div>

      {/* Add New Idea Form */}
      {isAddingNew && (
        <div className="border-2 border-sage rounded-2xl bg-white shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Idea</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newIdeaForm.item_name}
                onChange={(e) => setNewIdeaForm({ ...newIdeaForm, item_name: e.target.value })}
                placeholder="e.g., Winter Jacket, Rain Boots, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newIdeaForm.category}
                  onChange={(e) => setNewIdeaForm({ ...newIdeaForm, category: e.target.value })}
                  placeholder="e.g., Clothing, Shoes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <input
                  type="text"
                  value={newIdeaForm.size}
                  onChange={(e) => setNewIdeaForm({ ...newIdeaForm, size: e.target.value })}
                  placeholder="e.g., 3T, 7"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={newIdeaForm.brand}
                onChange={(e) => setNewIdeaForm({ ...newIdeaForm, brand: e.target.value })}
                placeholder="e.g., Nike, Carter's"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newIdeaForm.notes}
                onChange={(e) => setNewIdeaForm({ ...newIdeaForm, notes: e.target.value })}
                placeholder="Add details, links, or thoughts..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddNewIdea}
                className="flex-1 px-4 py-2 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Add Idea
              </button>
              <button
                onClick={handleCancelNewIdea}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-sand">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No ideas yet. Start brainstorming!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => {
            const isExpanded = expandedId === item.id;
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="border-2 border-sand rounded-2xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main card - clickable */}
                <button
                  onClick={() => handleCardClick(item.id)}
                  className="w-full p-4 text-left"
                  disabled={isEditing}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.item_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, item_name: e.target.value })}
                          className="flex-1 font-semibold text-gray-900 text-lg border-b-2 border-sage focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="font-semibold text-gray-900 text-lg">{item.item_name}</h3>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete idea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                      {item.category}
                    </span>
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
                  </div>
                </button>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-sand">
                    {isEditing ? (
                      /* Edit mode */
                      <div className="space-y-3 pt-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
                          <input
                            type="text"
                            value={editForm.brand || ''}
                            onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                          <input
                            type="text"
                            value={editForm.size || ''}
                            onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                          <textarea
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            placeholder="Add details, links, or thoughts..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="flex-1 px-4 py-2 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div className="space-y-3 pt-4">
                        {item.notes && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Notes:</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.notes}</p>
                          </div>
                        )}

                        {item.created_by && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <User className="w-3.5 h-3.5" />
                            <span>Added by {item.created_by === userEmail ? 'you' : 'your partner'}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Details
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(item)}
                            className="flex-1 px-4 py-2 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Add to Wishlist
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
