'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { RefreshCw } from 'lucide-react';

interface DailyAnchorProps {
  userId: string;
  initialMantra?: string | null;
}

const INSPIRING_QUOTES = [
  "Presence over perfection",
  "Every moment is a gift worth remembering",
  "Small moments make the biggest memories",
  "Today's ordinary is tomorrow's precious",
  "Capture what matters, not what's perfect",
  "Love in the little things",
  "One day, one moment, one memory",
  "These days are long, these years are short",
  "Being present is the present",
  "The days are long but the years are short"
];

export default function DailyAnchor({ userId, initialMantra }: DailyAnchorProps) {
  const [mantra, setMantra] = useState(initialMantra || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pastMantras, setPastMantras] = useState<string[]>([]);
  const supabase = createClient();

  // Fetch past mantras on mount
  useEffect(() => {
    const fetchPastMantras = async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('daily_mantra')
        .eq('user_id', userId)
        .not('daily_mantra', 'is', null)
        .limit(10);

      if (data) {
        const mantras = data.map(d => d.daily_mantra).filter(Boolean);
        setPastMantras(mantras);
      }
    };
    fetchPastMantras();
  }, [userId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ daily_mantra: mantra })
        .eq('user_id', userId);

      if (error) throw error;
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving mantra:', err);
      alert('Failed to save mantra. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Combine past mantras with inspiring quotes
    const allOptions = [...pastMantras, ...INSPIRING_QUOTES];

    // Filter out current mantra
    const availableOptions = allOptions.filter(opt => opt !== mantra);

    if (availableOptions.length > 0) {
      // Pick a random one
      const randomIndex = Math.floor(Math.random() * availableOptions.length);
      setMantra(availableOptions[randomIndex]);
    } else {
      // Fallback to any inspiring quote
      const randomIndex = Math.floor(Math.random() * INSPIRING_QUOTES.length);
      setMantra(INSPIRING_QUOTES[randomIndex]);
    }

    setTimeout(() => setIsRefreshing(false), 300);
  };

  const placeholder = "Add your daily anchor — a mantra, reminder, or quote to guide your day";

  return (
    <div className="bg-gradient-to-br from-sage/10 to-cornflower/10 rounded-2xl p-6 border border-sage/20">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-medium text-gray-700">Daily Anchor</h3>
        <div className="flex items-center gap-1">
          {!isEditing && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-gray-400 hover:text-sage hover:bg-sage/10 rounded-lg transition-all disabled:opacity-50"
              aria-label="Shuffle quote"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-sage hover:bg-sage/10 rounded-lg transition-colors"
              aria-label="Edit mantra"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 text-sage hover:bg-sage/10 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Save mantra"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={mantra}
          onChange={(e) => setMantra(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all resize-none text-gray-800"
          rows={3}
          autoFocus
        />
      ) : (
        <p className="text-lg font-serif text-gray-800 leading-relaxed italic">
          {mantra || (
            <span className="text-gray-400 not-italic">
              {placeholder}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
