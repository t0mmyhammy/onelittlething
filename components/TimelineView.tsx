'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import EditEntryModal from './EditEntryModal';
import { PencilIcon, FunnelIcon } from '@heroicons/react/24/outline';
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

interface Child {
  id: string;
  name: string;
  photo_url: string | null;
}

interface Entry {
  id: string;
  content: string;
  entry_date: string;
  created_by: string;
  entry_children?: Array<{
    children: {
      id: string;
      name: string;
      label_color?: string | null;
    };
  }>;
}

interface TimelineViewProps {
  initialEntries: Entry[];
  children: Child[];
  familyId: string;
  userId: string;
}

type SortOption = 'newest' | 'oldest';

export default function TimelineView({
  initialEntries,
  children,
  familyId,
  userId,
}: TimelineViewProps) {
  const supabase = createClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<Record<string, { email: string; full_name: string }>>({});
  const [mounted, setMounted] = useState(false);

  // Mark as mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch creator info for all entries
  useEffect(() => {
    const fetchCreatorInfo = async () => {
      const uniqueUserIds = [...new Set(initialEntries.map(e => e.created_by))];
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
  }, [initialEntries]);

  const handleEntryUpdated = () => {
    window.location.reload();
  };

  const handleEditClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let entries = [...initialEntries];

    // Filter by child
    if (selectedChildFilter) {
      entries = entries.filter((entry) =>
        entry.entry_children?.some(
          (ec) => ec.children.id === selectedChildFilter
        )
      );
    }

    // Sort by date
    entries.sort((a, b) => {
      const dateA = parseLocalDate(a.entry_date).getTime();
      const dateB = parseLocalDate(b.entry_date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return entries;
  }, [initialEntries, selectedChildFilter, sortOrder]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm">
        {/* Filters Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
              </button>

              {(selectedChildFilter || sortOrder !== 'newest') && (
                <button
                  onClick={() => {
                    setSelectedChildFilter(null);
                    setSortOrder('newest');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredAndSortedEntries.length} {filteredAndSortedEntries.length === 1 ? 'moment' : 'moments'}
              </span>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
              {/* Child Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by child:
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedChildFilter(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedChildFilter === null
                        ? 'bg-sage text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All children
                  </button>
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChildFilter(child.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedChildFilter === child.id
                          ? 'bg-sage text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by date:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder('newest')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortOrder === 'newest'
                        ? 'bg-sage text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Newest first
                  </button>
                  <button
                    onClick={() => setSortOrder('oldest')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortOrder === 'oldest'
                        ? 'bg-sage text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Oldest first
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Entries List */}
        <div className="p-6">
          {filteredAndSortedEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border border-sand rounded-lg hover:border-sage transition-colors group relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 flex-wrap items-center">
                      {/* Creator Initial Badge */}
                      {mounted && creatorInfo[entry.created_by] && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sage/20 text-sage flex items-center justify-center text-xs font-semibold ring-1 ring-sage/30">
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
                            className={`text-xs px-2 py-1 rounded-full ${colors.text}`}
                          >
                            {ec.children.name}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {parseLocalDate(entry.entry_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-sage"
                        aria-label="Edit moment"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{entry.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">No moments found</p>
              {selectedChildFilter && (
                <button
                  onClick={() => setSelectedChildFilter(null)}
                  className="text-sm text-sage hover:underline"
                >
                  Clear filter to see all moments
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <EditEntryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEntry(null);
        }}
        onEntryUpdated={handleEntryUpdated}
        entry={selectedEntry}
        children={children}
        familyId={familyId}
        userId={userId}
      />
    </>
  );
}
