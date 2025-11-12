'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';

type CompletionState = 'complete' | 'partial' | 'empty';

interface SectionCardProps {
  title: string;
  icon: React.ElementType;
  completionState: CompletionState;
  summary?: string;
  updatedAt?: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function SectionCard({
  title,
  icon: Icon,
  completionState,
  summary,
  updatedAt,
  children,
  isExpanded = false,
  onToggle
}: SectionCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const stateConfig = {
    complete: {
      icon: '🟢',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    partial: {
      icon: '🟡',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    empty: {
      icon: '⚪',
      color: 'text-gray-400',
      bg: 'bg-gray-50',
      border: 'border-gray-200'
    }
  };

  const config = stateConfig[completionState];

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays < 7) return `Updated ${diffDays}d ago`;
    if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)}w ago`;
    return `Updated ${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all ${
      isExpanded ? `${config.border} shadow-md` : 'border-sand shadow-sm hover:shadow-md'
    }`}>
      {/* Card Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start gap-4 text-left transition-colors hover:bg-gray-50/50 rounded-t-2xl"
      >
        {/* Icon & State */}
        <div className="flex-shrink-0 mt-1">
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="text-lg">{config.icon}</span>
          </div>

          {/* Summary or Status */}
          {summary && completionState !== 'empty' ? (
            <p className="text-sm text-gray-600 line-clamp-2">{summary}</p>
          ) : completionState === 'empty' ? (
            <p className="text-sm text-gray-400 italic">Not started</p>
          ) : null}

          {/* Metadata */}
          {updatedAt && (
            <p className="text-xs text-gray-400 mt-1">
              {getRelativeTime(updatedAt)}
            </p>
          )}
        </div>

        {/* Expand/Collapse */}
        <div className="flex-shrink-0 mt-1">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Edit Mode Toggle */}
          {!isEditing && (
            <div className="px-5 py-3 bg-gray-50/50 flex justify-end border-b border-gray-100">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-sage hover:bg-sage/10 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className={`p-5 ${isEditing ? 'bg-white' : 'bg-gray-50/30'}`}>
            {children}
          </div>

          {/* Edit Mode Actions */}
          {isEditing && (
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 rounded-b-2xl">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-lg font-medium hover:bg-sage/90 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
