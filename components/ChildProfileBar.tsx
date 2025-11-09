'use client';

import { User } from 'lucide-react';
import { getColorClasses } from '@/lib/labelColors';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  photo_url: string | null;
  label_color: string | null;
}

interface ChildProfileBarProps {
  children: Child[];
  selectedChildId: string;
  onSelectChild: (childId: string) => void;
}

export default function ChildProfileBar({
  children,
  selectedChildId,
  onSelectChild,
}: ChildProfileBarProps) {
  const calculateAge = (birthdate: string | null) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    const diffMs = today.getTime() - birth.getTime();
    const ageDate = new Date(diffMs);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = ageDate.getUTCMonth();

    if (years === 0) {
      return `${months}mo`;
    } else if (months === 0) {
      return `${years}y`;
    } else {
      return `${years}y ${months}mo`;
    }
  };

  return (
    <div className="w-56 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-sand p-4 sticky top-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Children
        </h3>
        <div className="space-y-2">
          {children.map((child) => {
            const isSelected = child.id === selectedChildId;
            const colors = getColorClasses(child.label_color);
            const age = calculateAge(child.birthdate);

            return (
              <button
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                  isSelected
                    ? 'bg-sage/10 ring-2 ring-sage/30'
                    : 'hover:bg-gray-50'
                }`}
              >
                {child.photo_url ? (
                  <img
                    src={child.photo_url}
                    alt={child.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                    style={{ borderColor: colors.hex }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-white"
                    style={{ backgroundColor: colors.hex }}
                  >
                    <User className={`w-6 h-6 ${colors.text}`} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {child.name}
                  </div>
                  {age && (
                    <div className="text-xs text-gray-500">
                      {age}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-sage flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
