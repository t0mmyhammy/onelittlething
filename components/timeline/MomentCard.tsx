'use client';

import { PencilIcon } from '@heroicons/react/24/outline';
import { getColorClasses } from '@/lib/labelColors';

interface Child {
  id: string;
  name: string;
  label_color?: string | null;
}

interface EntryChild {
  children: Child;
}

interface MomentCardProps {
  content: string;
  photoUrl?: string | null;
  entryChildren?: EntryChild[];
  onEditClick: () => void;
}

export default function MomentCard({
  content,
  photoUrl,
  entryChildren,
  onEditClick,
}: MomentCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      {/* Edit Button - Top Right */}
      <button
        onClick={onEditClick}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-sage"
        aria-label="Edit moment"
      >
        <PencilIcon className="w-5 h-5" />
      </button>

      {/* Child Tags - If Present */}
      {entryChildren && entryChildren.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {entryChildren.map((ec) => {
            const colors = getColorClasses(ec.children.label_color || undefined);
            return (
              <span
                key={ec.children.id}
                style={{ backgroundColor: colors.hex }}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors.text}`}
              >
                {ec.children.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Content */}
      <p className="text-gray-700 leading-relaxed pr-8">{content}</p>

      {/* Photo - If Present */}
      {photoUrl && (
        <div className="mt-4">
          <img
            src={photoUrl}
            alt="Moment photo"
            className="rounded-xl w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}
    </div>
  );
}
