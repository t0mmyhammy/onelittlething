'use client';

import { useState, useEffect } from 'react';
import { BookmarkIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface SavedAdvice {
  id: string;
  title: string;
  key_takeaways: string;
  created_at: string;
  conversation_id: string;
}

interface SavedAdviceListProps {
  onSelectConversation?: (conversationId: string) => void;
}

export default function SavedAdviceList({ onSelectConversation }: SavedAdviceListProps) {
  const [savedAdvice, setSavedAdvice] = useState<SavedAdvice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedAdvice();
  }, []);

  const loadSavedAdvice = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/saved');
      if (response.ok) {
        const data = await response.json();
        setSavedAdvice(data);
      }
    } catch (error) {
      console.error('Error loading saved advice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved advice?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/saved?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedAdvice(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting saved advice:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sand p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-sage border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (savedAdvice.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sand p-8 text-center">
        <BookmarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-serif text-gray-900 mb-2">No saved advice yet</h3>
        <p className="text-sm text-gray-600">
          Click the "Save" button in a conversation to pin key takeaways for later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-serif text-gray-900 mb-4">Your Saved Advice</h3>

      {savedAdvice.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-sm border border-sand p-4 transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-3 flex-1">
              <BookmarkIcon className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="text-sage hover:text-rose transition-colors p-1"
            >
              <ChevronRightIcon
                className={`w-5 h-5 transition-transform ${
                  expandedId === item.id ? 'rotate-90' : ''
                }`}
              />
            </button>
          </div>

          {expandedId === item.id && (
            <div className="mt-4 pt-4 border-t border-sand">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {item.key_takeaways}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                {onSelectConversation && (
                  <button
                    onClick={() => onSelectConversation(item.conversation_id)}
                    className="text-sm text-sage hover:text-rose font-medium transition-colors"
                  >
                    View full conversation
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
