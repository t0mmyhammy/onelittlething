'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface CreatePackListModalProps {
  familyId: string;
  userId: string;
  onClose: () => void;
}

export default function CreatePackListModal({
  familyId,
  userId,
  onClose,
}: CreatePackListModalProps) {
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error('Trip name is required');
      }

      // Create the pack list
      const { data: packList, error: packListError } = await supabase
        .from('pack_lists')
        .insert({
          family_id: familyId,
          created_by_user_id: userId,
          name: name.trim(),
          duration_days: durationDays ? parseInt(durationDays) : null,
        })
        .select()
        .single();

      if (packListError) throw packListError;

      // Create default categories
      const defaultCategories = [
        'Clothing',
        'Toiletries',
        'Gear',
        'Feeding',
        'Activities & Toys',
        'Misc',
      ];

      const categoriesData = defaultCategories.map((title, index) => ({
        pack_list_id: packList.id,
        title,
        order_index: index,
      }));

      const { error: categoriesError } = await supabase
        .from('pack_list_categories')
        .insert(categoriesData);

      if (categoriesError) throw categoriesError;

      // Redirect to the pack list detail page
      router.push(`/pack-lists/${packList.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create pack list');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif text-gray-900">New Pack List</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Trip Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Florida with grandparents"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              required
              autoFocus
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="e.g., 3"
              min="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                loading || !name.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-sage hover:opacity-90'
              }`}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
