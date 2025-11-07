'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Child {
  id: string;
  name: string;
  photo_url: string | null;
}

interface Entry {
  id: string;
  content: string;
  entry_date: string;
  entry_children?: Array<{
    children: {
      id: string;
      name: string;
    };
  }>;
}

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryUpdated: () => void;
  entry: Entry | null;
  children: Child[];
  familyId: string;
  userId: string;
}

// Helper function to get local date string in YYYY-MM-DD format
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EditEntryModal({
  isOpen,
  onClose,
  onEntryUpdated,
  entry,
  children,
  familyId,
  userId,
}: EditEntryModalProps) {
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(getLocalDateString(new Date()));
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [showChildSelection, setShowChildSelection] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const placeholder = "What moment do you want to remember?";

  // Populate form when entry changes
  useEffect(() => {
    if (entry && isOpen) {
      setContent(entry.content);
      setEntryDate(entry.entry_date);
      const childIds = entry.entry_children?.map(ec => ec.children.id) || [];
      setSelectedChildren(childIds);
      setShowDeleteConfirm(false);

      // Focus after data is set
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [entry, isOpen]);

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
      if (!entry) return;

      if (selectedChildren.length === 0) {
        throw new Error('Please select which kid(s) this moment is about');
      }

      // Update the entry
      const { error: entryError } = await supabase
        .from('entries')
        .update({
          content: content.trim(),
          entry_date: entryDate,
        })
        .eq('id', entry.id);

      if (entryError) throw entryError;

      // Delete existing child associations
      const { error: deleteError } = await supabase
        .from('entry_children')
        .delete()
        .eq('entry_id', entry.id);

      if (deleteError) throw deleteError;

      // Add new child associations
      const entryChildrenData = selectedChildren.map((childId) => ({
        entry_id: entry.id,
        child_id: childId,
      }));

      const { error: relationError } = await supabase
        .from('entry_children')
        .insert(entryChildrenData);

      if (relationError) throw relationError;

      onEntryUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    setError('');
    setLoading(true);

    try {
      // Delete child associations first
      const { error: deleteChildrenError } = await supabase
        .from('entry_children')
        .delete()
        .eq('entry_id', entry.id);

      if (deleteChildrenError) throw deleteChildrenError;

      // Delete the entry
      const { error: deleteError } = await supabase
        .from('entries')
        .delete()
        .eq('id', entry.id);

      if (deleteError) throw deleteError;

      onEntryUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-gray-900">Edit Moment</h2>
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

        {!showDeleteConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                What happened?
              </label>
              <textarea
                ref={textareaRef}
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* Select Children */}
            <div>
              {children.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600">About:</span>
                    {!showChildSelection && (
                      <div className="flex gap-2 flex-wrap items-center">
                        {selectedChildren.map((childId) => {
                          const child = children.find(c => c.id === childId);
                          return child ? (
                            <span key={childId} className="px-3 py-1 bg-sage/10 text-sage rounded-full font-medium">
                              {child.name}
                            </span>
                          ) : null;
                        })}
                        <button
                          type="button"
                          onClick={() => setShowChildSelection(true)}
                          className="px-3 py-1 text-cornflower hover:text-rose transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Child Selection Expanded */}
                  {showChildSelection && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {children.map((child) => {
                          const isSelected = selectedChildren.includes(child.id);
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => toggleChild(child.id)}
                              className={`p-3 border-2 rounded-lg transition-all text-left ${
                                isSelected
                                  ? 'border-sage bg-sage/10 ring-2 ring-sage/20'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {child.photo_url ? (
                                  <img
                                    src={child.photo_url}
                                    alt={child.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-sm text-gray-400">
                                      {child.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{child.name}</span>
                                    {isSelected && (
                                      <svg className="w-4 h-4 text-sage" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowChildSelection(false)}
                        className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-500">No children added</span>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When did this happen?
              </label>
              {!showDatePicker ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEntryDate(getLocalDateString(new Date()));
                      setShowDatePicker(false);
                    }}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      entryDate === getLocalDateString(new Date())
                        ? 'border-sage bg-sage/10 text-sage'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setEntryDate(getLocalDateString(yesterday));
                      setShowDatePicker(false);
                    }}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      (() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        return entryDate === getLocalDateString(yesterday);
                      })()
                        ? 'border-sage bg-sage/10 text-sage'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(true)}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      (() => {
                        const today = getLocalDateString(new Date());
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = getLocalDateString(yesterday);
                        return entryDate !== today && entryDate !== yesterdayStr;
                      })()
                        ? 'border-sage bg-sage/10 text-sage'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {(() => {
                      const today = getLocalDateString(new Date());
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      const yesterdayStr = getLocalDateString(yesterday);
                      if (entryDate !== today && entryDate !== yesterdayStr) {
                        // Parse the date locally
                        const [year, month, day] = entryDate.split('-').map(Number);
                        const date = new Date(year, month - 1, day);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }
                      return 'Select date';
                    })()}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    id="entryDate"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    max={getLocalDateString(new Date())}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                  content.trim() && !loading
                    ? 'bg-sage hover:scale-[1.02]'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          /* Delete Confirmation */
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-900 mb-2">Delete this moment?</h3>
              <p className="text-sm text-red-800">
                This action cannot be undone. This moment will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Deleting...' : 'Delete Moment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
