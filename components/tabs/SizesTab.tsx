'use client';

import { useState } from 'react';
import { Pencil, Check, X, Plus, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

interface SizesTabProps {
  childId: string;
  childName: string;
  childSizes: ChildSize | null;
}

interface SizeCategory {
  id: string;
  label: string;
  current: string;
  next: string;
  fitNotes: string;
  updatedAt: Date | null;
}

export default function SizesTab({ childId, childName, childSizes }: SizesTabProps) {
  const supabase = createClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sizes, setSizes] = useState<SizeCategory[]>([
    {
      id: 'shoes',
      label: 'Shoes',
      current: childSizes?.shoe_size?.split('/')[0] || '',
      next: childSizes?.shoe_size?.split('/')[1] || '',
      fitNotes: '',
      updatedAt: null,
    },
    {
      id: 'pants',
      label: 'Pants',
      current: childSizes?.pants_size?.split('/')[0] || '',
      next: childSizes?.pants_size?.split('/')[1] || '',
      fitNotes: '',
      updatedAt: null,
    },
    {
      id: 'shirts',
      label: 'Shirts',
      current: childSizes?.shirt_size?.split('/')[0] || '',
      next: childSizes?.shirt_size?.split('/')[1] || '',
      fitNotes: '',
      updatedAt: null,
    },
  ]);

  const handleSave = async (category: SizeCategory) => {
    const sizeData: Partial<ChildSize> = {};

    if (category.id === 'shoes') {
      sizeData.shoe_size = `${category.current}/${category.next}`;
    } else if (category.id === 'pants') {
      sizeData.pants_size = `${category.current}/${category.next}`;
    } else if (category.id === 'shirts') {
      sizeData.shirt_size = `${category.current}/${category.next}`;
    }

    await supabase
      .from('child_sizes')
      .upsert({
        child_id: childId,
        ...sizeData,
      }, {
        onConflict: 'child_id'
      });

    // Update local state with timestamp
    setSizes(prev => prev.map(s =>
      s.id === category.id
        ? { ...s, updatedAt: new Date() }
        : s
    ));

    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const updateSize = (id: string, field: 'current' | 'next' | 'fitNotes', value: string) => {
    setSizes(prev => prev.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 90) return `${Math.floor(days / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{childName}'s Sizes</h2>
          <p className="text-sm text-gray-600 mt-1">Keep current and next sizes up to date</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sage hover:text-rose transition-colors">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Size Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sizes.map((category) => {
          const isEditing = editingId === category.id;

          return (
            <div
              key={category.id}
              className="bg-white border border-sand rounded-xl p-5 hover:border-sage transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900">{category.label}</h3>
                {!isEditing ? (
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="text-gray-400 hover:text-sage transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSave(category)}
                      className="text-sage hover:text-sage/80 transition-colors"
                      aria-label="Save"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={category.current}
                      onChange={(e) => updateSize(category.id, 'current', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                      placeholder="e.g., 7"
                    />
                  ) : (
                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                      {category.current || '—'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Next</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={category.next}
                      onChange={(e) => updateSize(category.id, 'next', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                      placeholder="e.g., 8"
                    />
                  ) : (
                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                      {category.next || '—'}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fit Notes</label>
                    <input
                      type="text"
                      value={category.fitNotes}
                      onChange={(e) => updateSize(category.id, 'fitNotes', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                      placeholder="e.g., Runs small"
                    />
                  </div>
                )}
              </div>

              {category.updatedAt && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimestamp(category.updatedAt)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional: Smart Reminder */}
      <div className="mt-6 p-4 bg-sage/5 border border-sage/20 rounded-xl">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-sage mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Smart Reminder</h4>
            <p className="text-sm text-gray-600 mt-1">
              We'll remind you every 90 days to confirm sizes are up to date
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-sage hover:text-white hover:bg-sage rounded-lg transition-colors border border-sage">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
