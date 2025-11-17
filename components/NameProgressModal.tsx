'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface NameProgressModalProps {
  isOpen: boolean;
  type: 'enhancing' | 'generating';
  current?: number;
  total?: number;
  message?: string;
}

const enhancingMessages = [
  "Researching name meanings...",
  "Analyzing origins and history...",
  "Checking popularity trends...",
  "Finding perfect nicknames...",
  "Reviewing sibling compatibility...",
  "Crafting thoughtful insights...",
];

const generatingMessages = [
  "Analyzing your name preferences...",
  "Finding similar styles...",
  "Checking cultural origins...",
  "Matching popularity levels...",
  "Curating fresh ideas...",
  "Almost there...",
];

export default function NameProgressModal({
  isOpen,
  type,
  current,
  total,
  message
}: NameProgressModalProps) {
  const messages = type === 'enhancing' ? enhancingMessages : generatingMessages;
  const [messageIndex, setMessageIndex] = useState(0);
  const [breatheScale, setBreatheScale] = useState(1);

  useEffect(() => {
    if (!isOpen) return;

    const messageTimer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2500);

    const breatheTimer = setInterval(() => {
      setBreatheScale(prev => (prev === 1 ? 1.08 : 1));
    }, 1500);

    return () => {
      clearInterval(messageTimer);
      clearInterval(breatheTimer);
    };
  }, [isOpen, messages.length]);

  if (!isOpen) return null;

  const progress = current && total ? (current / total) * 100 : 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-fadeIn" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-slideUp pointer-events-auto">
          {/* Animated Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="p-4 bg-gradient-to-br from-purple-600 to-sage rounded-2xl shadow-lg transition-transform duration-1500"
              style={{ transform: `scale(${breatheScale})` }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Progress Ring */}
          {current && total && (
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * progress) / 100}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A094F7" />
                      <stop offset="100%" stopColor="#A7C4A0" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">
                    {current}/{total}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Indeterminate Progress Bar */}
          {(!current || !total) && (
            <div className="mb-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-sage animate-indeterminate w-1/3" />
              </div>
            </div>
          )}

          {/* Message */}
          <div className="text-center">
            <p
              key={messageIndex}
              className="text-lg font-medium text-gray-900 mb-2 animate-fade-in"
            >
              {message || messages[messageIndex]}
            </p>
            {current && total && (
              <p className="text-sm text-gray-600">
                {type === 'enhancing' ? 'Enhancing names' : 'Generating ideas'}
              </p>
            )}
          </div>

          {/* Tip */}
          <div className="mt-6 p-3 bg-purple-50 border border-purple-100 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              💡 This may take a minute. Feel free to grab a coffee!
            </p>
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

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 200ms ease-out;
        }

        .animate-slideUp {
          animation: slideUp 300ms ease-out;
        }

        .animate-fade-in {
          animation: fade-in 300ms ease-in-out;
        }

        .animate-indeterminate {
          animation: indeterminate 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
