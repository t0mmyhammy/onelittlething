'use client';

import { useEffect, useState } from 'react';
import { Wand2, Sparkles } from 'lucide-react';

interface AILoadingScreenProps {
  itemName?: string;
  showSuccess?: boolean;
  type?: 'default' | 'import';
}

const loadingMessages = [
  "Exploring the best options...",
  "Checking what's available...",
  "Curating recommendations...",
  "Looking for quality picks...",
  "Finding perfect matches...",
  "Searching thoughtfully...",
  "Reviewing top choices...",
  "Gathering ideas for you...",
];

const importMessages = [
  "Reading your list...",
  "Understanding each item...",
  "Extracting details...",
  "Organizing information...",
  "Creating cards...",
  "Almost there...",
];

const funFacts = [
  "Did you know most 4T sizes last about 6 months?",
  "Machine washable > everything else.",
  "Kids grow fastest in their first year.",
  "Quality basics last through multiple kids.",
];

export default function AILoadingScreen({ itemName, showSuccess = false, type = 'default' }: AILoadingScreenProps) {
  const messages = type === 'import' ? importMessages : loadingMessages;
  const [messageIndex, setMessageIndex] = useState(0);
  const [showFact, setShowFact] = useState(false);
  const [factIndex] = useState(Math.floor(Math.random() * funFacts.length));
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [breatheScale, setBreatheScale] = useState(1);

  // Rotate loading messages every 2 seconds
  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);

    // Show fun fact after 5 seconds
    const factTimer = setTimeout(() => {
      setShowFact(true);
    }, 5000);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(factTimer);
    };
  }, []);

  // Breathing animation for icon
  useEffect(() => {
    const breatheTimer = setInterval(() => {
      setBreatheScale(prev => (prev === 1 ? 1.08 : 1));
    }, 1500);

    return () => clearInterval(breatheTimer);
  }, []);

  // Sparkle animation every 2.5 seconds
  useEffect(() => {
    const sparkleTimer = setInterval(() => {
      const newSparkle = {
        id: Date.now(),
        x: Math.random() * 60 - 30, // -30 to 30
        y: Math.random() * 60 - 30,
      };
      setSparkles(prev => [...prev, newSparkle]);

      // Remove sparkle after animation completes
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
      }, 1000);
    }, 2500);

    return () => clearInterval(sparkleTimer);
  }, []);

  // Show success message if showSuccess is true
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 animate-fade-in">
        <div className="relative mb-6">
          <div className="p-4 bg-gradient-to-br from-[#A094F7] to-[#A7C4A0] rounded-2xl shadow-lg scale-110">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          {/* Success sparkles burst */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              }}
            >
              <Sparkles
                className="text-[#A094F7] animate-sparkle-burst"
                size={type === 'import' ? 16 : 12}
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
              />
            </div>
          ))}
        </div>
        <p className="text-lg font-semibold text-gray-900 animate-bounce-in mb-2">
          {type === 'import' ? '🎉 Cards created!' : 'Found a few great options!'}
        </p>
        {type === 'import' && (
          <p className="text-sm text-gray-600 animate-fade-in-delay">
            Your list has been turned into individual cards
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Animated Icon with Sparkles */}
      <div className="relative mb-6">
        <div
          className="p-4 bg-gradient-to-br from-[#A094F7] to-[#A7C4A0] rounded-2xl shadow-lg transition-transform duration-1500 ease-in-out"
          style={{ transform: `scale(${breatheScale})` }}
        >
          <Wand2 className="w-8 h-8 text-white" />
        </div>

        {/* Sparkles */}
        {sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: `translate(-50%, -50%)`,
              animation: 'sparkle-fade 1s ease-out forwards',
            }}
          >
            <Sparkles
              className="text-[#A094F7]"
              style={{
                transform: `translate(${sparkle.x}px, ${sparkle.y}px)`,
              }}
              size={16}
            />
          </div>
        ))}
      </div>

      {/* Gradient Progress Ring */}
      <div className="relative w-16 h-16 mb-4">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#F0EFF7"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeDasharray="176"
            strokeLinecap="round"
            className="animate-spin-slow"
            style={{
              strokeDashoffset: 44,
              transformOrigin: 'center',
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A094F7" />
              <stop offset="100%" stopColor="#A7C4A0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Loading Message with Fade Transition */}
      <div className="h-8 mb-2">
        <p
          key={messageIndex}
          className="text-base font-medium text-gray-700 text-center animate-fade-in"
        >
          {messages[messageIndex]}
        </p>
      </div>

      {/* Item Name */}
      {itemName && (
        <p className="text-sm text-gray-500 mb-4">
          {itemName}
        </p>
      )}

      {/* Fun Fact (appears after 5 seconds) */}
      {showFact && (
        <div className="mt-4 px-4 py-3 bg-[#FDFCFB] border border-[#E8E7F0] rounded-lg max-w-xs animate-fade-in">
          <p className="text-xs text-gray-600 text-center italic">
            💡 {funFacts[factIndex]}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes sparkle-fade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
        }

        @keyframes sparkle-burst {
          0% {
            opacity: 0;
            transform: translateX(0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translateX(30px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(60px) scale(0.5);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
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

        .animate-fade-in {
          animation: fade-in 300ms ease-in-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 500ms ease-in-out 200ms both;
        }

        .animate-bounce-in {
          animation: bounce-in 500ms ease-out;
        }

        .animate-sparkle-burst {
          animation: sparkle-burst 600ms ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
