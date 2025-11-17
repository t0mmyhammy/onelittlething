'use client';

import { useState } from 'react';
import { SparklesIcon, XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface WeeklyHighlightsProps {
  familyId: string;
}

interface Highlights {
  summary: string;
  reflectionQuestions: string[];
  entryCount: number;
  periodDays: number;
}

export default function WeeklyHighlights({ familyId }: WeeklyHighlightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<Highlights | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-weekly-highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId, daysBack: 7 }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isEmpty) {
          setError(data.error);
        } else {
          throw new Error(data.error || 'Failed to generate highlights');
        }
        setLoading(false);
        return;
      }

      setHighlights(data);
      setIsOpen(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-sage text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-medium shadow-sm"
      >
        <SparklesIcon className="w-4 h-4" />
        {loading ? 'Generating...' : 'Weekly Highlights'}
      </button>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md z-50">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Highlights Modal */}
      {isOpen && highlights && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp pointer-events-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-sage p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Weekly Highlights
                    </h2>
                    <p className="text-purple-100 text-sm">
                      {highlights.entryCount} moment{highlights.entryCount !== 1 ? 's' : ''} from the past {highlights.periodDays} days
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Summary Section */}
                <div className="bg-gradient-to-br from-purple-50 to-sage/10 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <SparklesIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Your Week in Review</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {highlights.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reflection Questions Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <LightBulbIcon className="w-5 h-5 text-sage" />
                    <h3 className="font-semibold text-gray-900">Reflection & Inspiration</h3>
                  </div>
                  <div className="space-y-4">
                    {highlights.reflectionQuestions.map((question, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-4 border-l-4 border-sage shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage/20 text-sage flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <p className="text-gray-700 leading-relaxed">
                            {question}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-cream rounded-xl p-4 text-center border border-gray-200">
                  <p className="text-sm text-gray-600">
                    Use these reflections to guide your next moments and stay present in your parenting journey 💛
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-3 bg-sage text-white rounded-lg hover:bg-sage/90 font-medium transition-colors"
                >
                  Close
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
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fadeIn {
              animation: fadeIn 200ms ease-out;
            }

            .animate-slideUp {
              animation: slideUp 300ms ease-out;
            }
          `}</style>
        </>
      )}
    </>
  );
}
