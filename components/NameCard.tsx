'use client';

import { useState, useEffect } from 'react';
import { BabyName } from './NameBoardView';

interface NameCardProps {
  name: BabyName;
  onClick: () => void;
  onToggleFavorite: () => void;
  onLongPress: () => void;
}

export default function NameCard({ name, onClick, onToggleFavorite, onLongPress }: NameCardProps) {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      onLongPress();
    }, 500);
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
    };
  }, [pressTimer]);

  // Count reactions
  const reactionCount = Object.values(name.reactions || {}).reduce(
    (sum: number, reactions: any) => sum + reactions.length,
    0
  );

  return (
    <div
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 active:scale-95"
    >
      {/* AI Badge - Top Left */}
      {name.is_ai_generated && (
        <div className="absolute top-3 left-3 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
          <span className="text-xs">✨</span>
          AI
        </div>
      )}

      {/* Favorite Star - Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-3 right-3 text-xl transition-transform hover:scale-110"
      >
        {name.is_favorite ? '⭐' : '☆'}
      </button>

      {/* Name - Center */}
      <div className="text-center pt-2 pb-3">
        <h3 className="text-xl font-semibold text-gray-900 font-serif">
          {name.name}
        </h3>
      </div>

      {/* Bottom Row: Type Chip & Reactions */}
      <div className="flex items-center justify-between mt-2">
        {/* Type Chip */}
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            name.type === 'first'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          }`}
        >
          {name.type === 'first' ? 'F' : 'M'}
        </span>

        {/* Reaction Count */}
        {reactionCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>❤️</span>
            <span>{reactionCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
