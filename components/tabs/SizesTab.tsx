'use client';

import { useState, useEffect } from 'react';
import { Pencil, Check, X, Clock, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SizeCategory {
  id: string;
  category: string;
  current_size: string | null;
  next_size: string | null;
  fit_notes: string | null;
  updated_at: string;
}

interface SizesTabProps {
  childId: string;
  childName: string;
  childSizes: any; // Legacy prop, not used anymore
}

// Common size categories parents might want to track
const COMMON_CATEGORIES = [
  'Shoes',
  'Pants',
  'Shirts',
  'Diapers',
  'Coat/Jacket',
  'Hat',
  'Gloves/Mittens',
  'Socks',
  'Pajamas',
  'Underwear',
  'Dress',
  'Swimsuit',
];

export default function SizesTab({ childId, childName }: SizesTabProps) {
  const supabase = createClient();
  const [categories, setCategories] = useState<SizeCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{
    current: string;
    next: string;
    fitNotes: string;
  }>({ current: '', next: '', fitNotes: '' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
    const { error } = await supabase
      .from('child_size_categories')
      .update({
        current_size: editingValues.current || null,
        next_size: editingValues.next || null,
        fit_notes: editingValues.fitNotes || null,
        updated_at: new Date().toISOString(),
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
      fitNotes: category.fit_notes || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValues({ current: '', next: '', fitNotes: '' });
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

  const availableCategories = COMMON_CATEGORIES.filter(
    cat => !categories.find(c => c.category.toLowerCase() === cat.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading sizes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{childName}'s Sizes</h2>
          <p className="text-sm text-gray-600 mt-1">Track current and next sizes</p>
        </div>
        {!isAddingCategory && (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sage hover:text-white hover:bg-sage border border-sage rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      {/* Add Category Form */}
      {isAddingCategory && (
        <div className="bg-sage/5 border border-sage/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Add Size Category</h3>
            <button
              onClick={() => {
                setIsAddingCategory(false);
                setNewCategoryName('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Select Common Categories */}
          {availableCategories.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {availableCategories.slice(0, 8).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setNewCategoryName(cat);
                      handleAddCategory();
                    }}
                    className="px-3 py-1 text-sm bg-white border border-sand rounded-lg hover:border-sage hover:bg-sage/5 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Category Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="Or type custom category..."
              className="flex-1 px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
              autoFocus
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 bg-sage text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Size List */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-2">No size categories yet</p>
          <p className="text-sm text-gray-400">Click "Add Category" to start tracking sizes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const isEditing = editingId === category.id;

            return (
              <div
                key={category.id}
                className="bg-white border border-sand rounded-xl p-4 hover:border-sage transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                  <div className="flex items-center gap-1">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-gray-400 hover:text-sage transition-colors p-1"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSave(category.id)}
                          className="text-sage hover:text-sage/80 transition-colors p-1"
                          aria-label="Save"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                          aria-label="Cancel"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Current/Next Sizes */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Current</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingValues.current}
                        onChange={(e) => setEditingValues({ ...editingValues, current: e.target.value })}
                        className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none text-center"
                        placeholder="e.g., 3T"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 font-semibold text-center min-h-[42px] flex items-center justify-center">
                        {category.current_size || '—'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Next</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingValues.next}
                        onChange={(e) => setEditingValues({ ...editingValues, next: e.target.value })}
                        className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none text-center"
                        placeholder="e.g., 4T"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600 font-medium text-center min-h-[42px] flex items-center justify-center">
                        {category.next_size || '—'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fit Notes */}
                {isEditing && (
                  <div className="mb-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Fit Notes</label>
                    <input
                      type="text"
                      value={editingValues.fitNotes}
                      onChange={(e) => setEditingValues({ ...editingValues, fitNotes: e.target.value })}
                      className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                      placeholder="e.g., Runs small"
                    />
                  </div>
                )}

                {!isEditing && category.fit_notes && (
                  <div className="mb-3 text-sm text-gray-600 italic">
                    {category.fit_notes}
                  </div>
                )}

                {/* Timestamp */}
                {category.updated_at && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimestamp(category.updated_at)}</span>
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
