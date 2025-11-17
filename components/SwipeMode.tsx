'use client';

import { useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { BabyName } from './NameBoardView';

interface SwipeModeProps {
  names: BabyName[];
  onBack: () => void;
  onFavorite: (nameId: string) => void;
}

export default function SwipeMode({ names, onBack, onFavorite }: SwipeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const currentName = names[currentIndex];

  if (!currentName) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <p className="text-2xl text-gray-600 mb-4">All done! 🎉</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-sage text-white rounded-full font-medium hover:opacity-90"
        >
          Back to Board
        </button>
      </div>
    );
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);

    if (direction === 'right') {
      onFavorite(currentName.id);
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Board
          </button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {names.length}
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div
          className={`bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transition-all duration-300 ${
            swipeDirection === 'left' ? 'translate-x-[-100%] opacity-0' :
            swipeDirection === 'right' ? 'translate-x-[100%] opacity-0' :
            'translate-x-0 opacity-100'
          }`}
        >
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-serif text-gray-900">
              {currentName.name}
            </h1>

            <div className="flex items-center justify-center gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  currentName.type === 'first'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {currentName.type === 'first' ? 'First' : 'Middle'}
              </span>
              {currentName.is_favorite && <span className="text-2xl">⭐</span>}
            </div>

            {currentName.notes && (
              <p className="text-gray-600 text-lg italic">
                "{currentName.notes}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Swipe Buttons */}
      <div className="fixed bottom-8 left-0 right-0 px-4">
        <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
          <button
            onClick={() => handleSwipe('left')}
            className="w-20 h-20 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-3xl transition-all active:scale-95 shadow-lg"
          >
            👈
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-20 h-20 bg-sage hover:opacity-90 rounded-full flex items-center justify-center text-3xl transition-all active:scale-95 shadow-lg"
          >
            ❤️
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Swipe left to skip, right to keep
        </p>
      </div>
    </div>
  );
}
