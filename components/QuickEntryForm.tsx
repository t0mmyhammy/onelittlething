'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HeartIcon } from '@heroicons/react/24/outline';

interface Child {
  id: string;
  name: string;
  photo_url: string | null;
}

interface QuickEntryFormProps {
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

export default function QuickEntryForm({
  children,
  familyId,
  userId,
}: QuickEntryFormProps) {
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(getLocalDateString(new Date()));
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // Fixed placeholder to avoid hydration mismatch
  const placeholder = "What moment do you want to remember?";

  const toggleChild = (childId: string) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
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
      setIsExpanded(false);
      setShowDatePicker(false);

      // Refresh page
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-sage/20">
      {/* Collapsed State - Just the text field */}
      {!isExpanded ? (
        <button
          onClick={handleExpand}
          className="w-full text-left"
        >
          <div className="flex items-center gap-3">
            <HeartIcon className="w-7 h-7 text-rose" />
            <div className="flex-1">
              <p className="text-lg font-serif text-gray-400">
                {placeholder}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click to capture a moment
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      ) : (
        /* Expanded State - Full form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Collapse button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-serif text-gray-900">Capture a moment</h3>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setContent('');
                setShowDatePicker(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Child Selection - Simple Buttons */}
          <div>
            {children.length > 0 ? (
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">About:</label>
                <div className="flex gap-2 flex-wrap">
                  {children.map((child) => {
                    const isSelected = selectedChildren.includes(child.id);
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => toggleChild(child.id)}
                        className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-sage bg-sage/10 text-sage'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {child.name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500">
                  {selectedChildren.length === 0
                    ? 'Select which kid(s) this is related to'
                    : `${selectedChildren.length} selected`}
                </p>
              </div>
            ) : (
              <span className="text-sm text-gray-500">No children added</span>
            )}
          </div>

          {/* Date Quick Buttons */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">When:</label>
            {!showDatePicker ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEntryDate(getLocalDateString(new Date()));
                  }}
                  className={`flex-1 px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
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
                  }}
                  className={`flex-1 px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
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
                  className={`flex-1 px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
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
              <div className="space-y-2">
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  max={getLocalDateString(new Date())}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="w-full px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className={`w-full px-4 py-3 rounded-lg font-medium text-white transition-all ${
              content.trim() && !loading
                ? 'bg-sage hover:scale-[1.02]'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Saving...' : 'Save Moment'}
          </button>
        </form>
      )}
    </div>
  );
}
