'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

interface DailyAnchorProps {
  userId: string;
  initialMantra?: string | null;
}

export default function DailyAnchor({ userId, initialMantra }: DailyAnchorProps) {
  const [mantra, setMantra] = useState(initialMantra || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

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

  const placeholder = "Add your daily anchor — a mantra, reminder, or quote to guide your day";

  return (
    <div className="bg-gradient-to-br from-sage/10 to-cornflower/10 rounded-2xl p-6 border border-sage/20">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-medium text-gray-700">Daily Anchor</h3>
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
