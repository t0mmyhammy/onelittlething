'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BabyName } from './NameBoardView';

interface TierNameCardProps {
  name: BabyName;
}

export default function TierNameCard({ name }: TierNameCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: name.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{name.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                name.type === 'first'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {name.type === 'first' ? 'First' : 'Middle'}
            </span>
            {name.is_ai_generated && (
              <span className="text-xs text-purple-600 flex items-center gap-0.5">
                <span>✨</span>
                AI
              </span>
            )}
            {name.is_favorite && <span className="text-sm">⭐</span>}
          </div>
        </div>
        <div className="text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>
    </div>
  );
}
