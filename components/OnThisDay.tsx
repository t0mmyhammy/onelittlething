'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getColorClasses } from '@/lib/labelColors';

// Helper to parse date string without timezone conversion
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper to get creator's initial
const getCreatorInitial = (creatorInfo?: { email: string; full_name: string }): string => {
  if (!creatorInfo) return '?';
  const name = creatorInfo.full_name || creatorInfo.email?.split('@')[0] || 'User';
  return name.charAt(0).toUpperCase();
};

interface Entry {
  id: string;
  content: string;
  entry_date: string;
  created_by: string;
  photo_url?: string | null;
  entry_children?: Array<{
    children: {
      id: string;
      name: string;
      label_color?: string | null;
    };
  }>;
}

interface OnThisDayProps {
  entries: Entry[];
}

export default function OnThisDay({ entries }: OnThisDayProps) {
  const supabase = createClient();
  const [creatorInfo, setCreatorInfo] = useState<Record<string, { email: string; full_name: string }>>({});
  const [mounted, setMounted] = useState(false);

  // Mark as mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch creator info for all entries
  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!entries || entries.length === 0) return;

      const uniqueUserIds = [...new Set(entries.map(e => e.created_by))];
      if (uniqueUserIds.length === 0) return;

      const { data, error } = await supabase.rpc('get_user_info', {
        user_ids: uniqueUserIds
      });

      if (data && !error) {
        const infoMap: Record<string, { email: string; full_name: string }> = {};
        data.forEach((user: any) => {
          infoMap[user.id] = {
            email: user.email,
            full_name: user.full_name
          };
        });
        setCreatorInfo(infoMap);
      }
    };

    fetchCreatorInfo();
  }, [entries]);

  if (!entries || entries.length === 0) return null;

  // Get how many years ago
  const getYearsAgo = (dateString: string) => {
    const entryDate = parseLocalDate(dateString);
    const today = new Date();
    const years = today.getFullYear() - entryDate.getFullYear();
    return years;
  };

  return (
    <div className="bg-gradient-to-br from-amber/20 to-rose/20 p-6 rounded-2xl shadow-sm border border-amber/30">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">✨</span>
        <h3 className="text-xl font-serif text-gray-900">On This Day</h3>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => {
          const yearsAgo = getYearsAgo(entry.entry_date);
          return (
            <div key={entry.id} className="bg-white/80 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 flex-wrap items-center">
                  {/* Creator Initial Badge */}
                  {mounted && creatorInfo[entry.created_by] && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-medium">
                      {getCreatorInitial(creatorInfo[entry.created_by])}
                    </div>
                  )}
                  {/* Child Tags */}
                  {entry.entry_children?.map((ec: any) => {
                    const colors = getColorClasses(ec.children.label_color || undefined);
                    return (
                      <span
                        key={ec.children.id}
                        style={{ backgroundColor: colors.hex }}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${colors.text}`}
                      >
                        {ec.children.name}
                      </span>
                    );
                  })}
                </div>
                <span className="text-sm font-medium text-rose">
                  {yearsAgo === 1 ? '1 year ago' : `${yearsAgo} years ago`}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{entry.content}</p>
              {entry.photo_url && (
                <div className="mt-3">
                  <img
                    src={entry.photo_url}
                    alt="Moment photo"
                    className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-4 italic text-center">
        Memories from {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} in years past
      </p>
    </div>
  );
}
