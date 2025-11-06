'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Child {
  id: string;
  name: string;
  photo_url: string | null;
}

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryCreated: () => void;
  children: Child[];
  familyId: string;
  userId: string;
}

export default function NewEntryModal({
  isOpen,
  onClose,
  onEntryCreated,
  children,
  familyId,
  userId,
}: NewEntryModalProps) {
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const toggleChild = (childId: string) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (selectedChildren.length === 0) {
        throw new Error('Please select at least one child');
      }

      // Create the entry
      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .insert({
          family_id: familyId,
          created_by: userId,
          content: content.trim(),
          entry_date: entryDate,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Create entry-child relationships
      const entryChildrenData = selectedChildren.map((childId) => ({
        entry_id: entry.id,
        child_id: childId,
      }));

      const { error: relationError } = await supabase
        .from('entry_children')
        .insert(entryChildrenData);

      if (relationError) throw relationError;

      // Reset form
      setContent('');
      setEntryDate(new Date().toISOString().split('T')[0]);
      setSelectedChildren([]);
      onEntryCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-gray-900">New Moment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Date */}
          <div>
            <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              id="entryDate"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Select Children */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Who is this about? <span className="text-rose">*</span>
            </label>
            {children.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => toggleChild(child.id)}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      selectedChildren.includes(child.id)
                        ? 'border-sage bg-sage/10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {child.photo_url ? (
                        <img
                          src={child.photo_url}
                          alt={child.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xl text-gray-400">
                            {child.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{child.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600 mb-2">No children added yet</p>
                <p className="text-sm text-gray-500">Add a child first to create entries</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              What happened today? <span className="text-rose">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              placeholder="Parker said the funniest thing at dinner..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Capture the little things - they become the big things
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim() || selectedChildren.length === 0}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                content.trim() && selectedChildren.length > 0 && !loading
                  ? 'bg-sage hover:scale-[1.02]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Saving...' : 'Save Moment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
