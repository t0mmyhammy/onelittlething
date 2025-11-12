'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SectionGroupProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function SectionGroup({
  title,
  subtitle,
  defaultExpanded = true,
  children
}: SectionGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-4">
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group py-3 px-4 rounded-xl hover:bg-gray-50/50 transition-colors"
      >
        <div className="text-left">
          <h2 className="text-xl font-serif text-gray-900 group-hover:text-sage transition-colors flex items-center gap-2">
            {title}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </button>

      {/* Group Content */}
      {isExpanded && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
