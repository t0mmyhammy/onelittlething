'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { NameType } from './NameBoardView';

interface AddNameSheetProps {
  onClose: () => void;
  onAdd: (name: string, type: NameType) => void;
}

export default function AddNameSheet({ onClose, onAdd }: AddNameSheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<NameType>('first');

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim(), type);
      setName('');
      setType('first');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl z-50 animate-slideUp max-w-2xl mx-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 font-serif">
              Add Name
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Name Input */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Name"
            autoFocus
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent mb-4"
          />

          {/* Type Selector - iOS Style Pills */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setType('first')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                type === 'first'
                  ? 'bg-sage text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              First
            </button>
            <button
              onClick={() => setType('middle')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                type === 'middle'
                  ? 'bg-sage text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Middle
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-3 bg-sage text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
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
