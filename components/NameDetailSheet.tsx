'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { BabyName, NameType } from './NameBoardView';

interface Child {
  id: string;
  name: string;
  birthdate: string;
}

interface NameDetailSheetProps {
  name: BabyName;
  userId: string;
  children: Child[];
  lastName: string;
  onClose: () => void;
  onUpdate: (nameId: string, updates: Partial<BabyName>) => void;
  onDelete: (nameId: string) => void;
  onToggleReaction: (nameId: string, emoji: string) => void;
  onEnhance: (nameId: string, addAINote?: boolean) => void;
}

export default function NameDetailSheet({
  name,
  userId,
  children,
  lastName,
  onClose,
  onUpdate,
  onDelete,
  onToggleReaction,
  onEnhance,
}: NameDetailSheetProps) {
  const [notes, setNotes] = useState(name.notes || '');
  const [showAIInfo, setShowAIInfo] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  // Sync notes when name prop changes (e.g., after AI adds insight)
  useEffect(() => {
    setNotes(name.notes || '');
  }, [name.notes]);

  const userReactions = name.reactions?.[userId] || [];
  const enhanced = name.ai_enhanced_notes;

  const handleSaveNotes = () => {
    if (notes !== name.notes) {
      onUpdate(name.id, { notes: notes.trim() || null });
    }
  };

  const handleToggleType = () => {
    const newType: NameType = name.type === 'first' ? 'middle' : 'first';
    onUpdate(name.id, { type: newType });
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    await onEnhance(name.id);
    setEnhancing(false);
    setShowAIInfo(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
        <div
          className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-2 sm:hidden">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-gray-900 font-serif mb-3">
                  {name.name}
                </h1>

                {/* Type Toggle & Favorite */}
                <div className="flex items-center gap-3">
                  {/* F/M Toggle Pills */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleToggleType}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        name.type === 'first'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      First
                    </button>
                    <button
                      onClick={handleToggleType}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        name.type === 'middle'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      Middle
                    </button>
                  </div>

                  {/* Favorite Star */}
                  <button
                    onClick={() => onUpdate(name.id, { is_favorite: !name.is_favorite })}
                    className="text-2xl transition-transform hover:scale-110"
                  >
                    {name.is_favorite ? '⭐' : '☆'}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <button
                  onClick={async () => {
                    setEnhancing(true);
                    await onEnhance(name.id, true);
                    setEnhancing(false);
                  }}
                  disabled={enhancing}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  <span>✨</span>
                  Add AI Insight
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Why we like this name..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
              />
            </div>

            {/* Reactions */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Reactions
              </label>
              <div className="flex gap-3">
                {['❤️', '👍', '😍'].map(emoji => {
                  const isActive = userReactions.includes(emoji);
                  return (
                    <button
                      key={emoji}
                      onClick={() => onToggleReaction(name.id, emoji)}
                      className={`text-2xl p-3 rounded-full transition-all ${
                        isActive
                          ? 'bg-sage/20 scale-110'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Enhance */}
            <div>
              {!enhanced ? (
                <button
                  onClick={handleEnhance}
                  disabled={enhancing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sage to-sage/80 text-white rounded-xl hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                >
                  <SparklesIcon className="w-5 h-5" />
                  {enhancing ? 'Learning...' : 'Learn more about this name'}
                </button>
              ) : (
                <div className="border border-sage/30 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowAIInfo(!showAIInfo)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-sage/5 hover:bg-sage/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-sage" />
                      <span className="font-medium text-sage">Meaning & Origin</span>
                    </div>
                    {showAIInfo ? (
                      <ChevronUpIcon className="w-5 h-5 text-sage" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-sage" />
                    )}
                  </button>

                  {showAIInfo && (
                    <div className="p-4 space-y-3 text-sm">
                      {enhanced.meaning && (
                        <div>
                          <p className="font-semibold text-sage uppercase tracking-wide text-xs mb-1">
                            Meaning
                          </p>
                          <p className="text-gray-700">{enhanced.meaning}</p>
                        </div>
                      )}
                      {enhanced.origin && (
                        <div>
                          <p className="font-semibold text-sage uppercase tracking-wide text-xs mb-1">
                            Origin
                          </p>
                          <p className="text-gray-700">{enhanced.origin}</p>
                        </div>
                      )}
                      {enhanced.popularity && (
                        <div>
                          <p className="font-semibold text-sage uppercase tracking-wide text-xs mb-1">
                            Popularity
                          </p>
                          <p className="text-gray-700">{enhanced.popularity}</p>
                        </div>
                      )}
                      {enhanced.nicknames && enhanced.nicknames.length > 0 && (
                        <div>
                          <p className="font-semibold text-sage uppercase tracking-wide text-xs mb-1">
                            Nicknames
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {enhanced.nicknames.map((nick: string, i: number) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-white border border-sage/30 text-gray-700 rounded-full text-xs"
                              >
                                {nick}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {enhanced.siblingCompatibility && (
                        <div>
                          <p className="font-semibold text-sage uppercase tracking-wide text-xs mb-1">
                            With Siblings
                          </p>
                          <p className="text-gray-700">{enhanced.siblingCompatibility}</p>
                        </div>
                      )}
                      {enhanced.fullNameFlow && (
                        <div>
                          <p className="font-semibold text-sage uppercase tracking-wide text-xs mb-1">
                            Full Name
                          </p>
                          <p className="text-gray-700">{enhanced.fullNameFlow}</p>
                        </div>
                      )}
                      {enhanced.initials && (
                        <div>
                          <p className="font-semibold text-sage uppercase tracking-wide text-xs mb-1">
                            Initials
                          </p>
                          <p className="text-gray-700">{enhanced.initials}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => {
                if (confirm(`Delete "${name.name}"?`)) {
                  onDelete(name.id);
                }
              }}
              className="w-full py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
            >
              Delete Name
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
