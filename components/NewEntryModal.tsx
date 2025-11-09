'use client';

import { useState, useEffect, useRef } from 'react';
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

// Helper function to get local date string in YYYY-MM-DD format
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function NewEntryModal({
  isOpen,
  onClose,
  onEntryCreated,
  children,
  familyId,
  userId,
}: NewEntryModalProps) {
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(getLocalDateString(new Date()));
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // Fixed placeholder to avoid hydration mismatch
  const placeholder = "What moment do you want to remember?";

  // Auto-focus text field when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to ensure modal animation completes
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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
        throw new Error('Please select which kid(s) this moment is about');
      }

      const childrenToTag = selectedChildren;

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
      const entryChildrenData = childrenToTag.map((childId) => ({
        entry_id: entry.id,
        child_id: childId,
      }));

      const { error: relationError } = await supabase
        .from('entry_children')
        .insert(entryChildrenData);

      if (relationError) throw relationError;

      // Reset form
      setContent('');
      setEntryDate(getLocalDateString(new Date()));
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

          {/* Content - moved to top for immediate focus */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              What happened today?
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
            <p className="text-xs text-gray-500 mt-1">
              Capture the little things - they become the big things
            </p>
          </div>

          {/* Select Children */}
          <div>
            {children.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Who is this about?
                </label>
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
                {children.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChildren(children.map(c => c.id));
                    }}
                    className="px-4 py-2 text-sm bg-sage/10 text-sage rounded-lg hover:bg-sage/20 transition-colors"
                  >
                    Select all
                  </button>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-500">No children added</span>
            )}
          </div>

          {/* Date - Quick Buttons */}
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
              {loading ? 'Saving...' : 'Save Moment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
