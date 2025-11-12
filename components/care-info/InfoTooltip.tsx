'use client';

import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  cdcGuidelines?: string;
  parentingTips?: string;
  ageInMonths?: number;
}

export default function InfoTooltip({ title, cdcGuidelines, parentingTips, ageInMonths }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-sage transition-colors"
        type="button"
      >
        <Info className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-sand p-6 max-w-lg w-[90vw] z-50 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg text-gray-900">{title}</h3>
                {ageInMonths !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">
                    Age: {Math.floor(ageInMonths / 12)} years {ageInMonths % 12} months
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CDC Guidelines */}
            {cdcGuidelines && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="text-base">🏥</span>
                  CDC Guidelines
                </h4>
                <p className="text-sm text-blue-800 whitespace-pre-line leading-relaxed">
                  {cdcGuidelines}
                </p>
              </div>
            )}

            {/* Parenting Tips */}
            {parentingTips && (
              <div className="p-4 bg-sage/10 rounded-lg border border-sage/20">
                <h4 className="text-sm font-semibold text-sage mb-2 flex items-center gap-2">
                  <span className="text-base">💡</span>
                  Parenting Tips
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {parentingTips}
                </p>
              </div>
            )}

            {!cdcGuidelines && !parentingTips && (
              <p className="text-sm text-gray-500 italic">
                No guidelines available for this field.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
