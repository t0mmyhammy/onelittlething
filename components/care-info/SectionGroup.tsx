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
        className="flex items-center gap-2 group"
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-hover:text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-hover:text-gray-600" />
        )}
        <div>
          <h2 className="text-xl font-serif text-gray-900 group-hover:text-sage transition-colors">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </button>

      {/* Group Content */}
      {isExpanded && (
        <div className="space-y-3 pl-7 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
