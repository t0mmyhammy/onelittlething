'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import NewEntryModal from './NewEntryModal';
import EditEntryModal from './EditEntryModal';
import { BarsArrowUpIcon, PencilSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import TimelineNode from './timeline/TimelineNode';
import MomentCard from './timeline/MomentCard';

// Helper to parse date string without timezone conversion
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper to get creator's initial
const getCreatorInitial = (creatorInfo?: { email: string; full_name: string }): string => {
  if (!creatorInfo) return '';
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
  photo_url?: string | null;
  entry_children?: Array<{
    children: {
      id: string;
      name: string;
      label_color?: string | null;
    };
  }>;
}

interface EntriesSectionProps {
  initialEntries: Entry[];
  children: Child[];
  familyId: string;
  userId: string;
}

type SortOption = 'newest' | 'oldest';

export default function EntriesSection({
  initialEntries,
  children,
  familyId,
  userId,
}: EntriesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorInfo, setCreatorInfo] = useState<Record<string, { email: string; full_name: string }>>({});
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default
  const [visibleCount, setVisibleCount] = useState(10); // Show first 10 entries when using Load More
  const supabase = createClient();

  // Mark as mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch creator information for all entries
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

  const handleEntryCreated = () => {
    // Refresh the page to show new entry
    window.location.reload();
  };

  const handleEntryUpdated = () => {
    // Refresh the page to show updated entry
    window.location.reload();
  };

  const handleEditClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  // Filter and sort entries, then group by date
  const groupedEntries = useMemo(() => {
    let entries = [...initialEntries];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      entries = entries.filter((entry) =>
        entry.content.toLowerCase().includes(query)
      );
    }

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

    // Group entries by date
    const grouped: { [date: string]: Entry[] } = {};
    entries.forEach((entry) => {
      if (!grouped[entry.entry_date]) {
        grouped[entry.entry_date] = [];
      }
      grouped[entry.entry_date].push(entry);
    });

    return grouped;
  }, [initialEntries, selectedChildFilter, sortOrder, searchQuery]);

  const filteredAndSortedEntries = useMemo(() => {
    return Object.values(groupedEntries).flat();
  }, [groupedEntries]);

  // Limit entries shown based on expanded state and visibleCount
  const visibleEntries = useMemo(() => {
    if (!isExpanded) {
      // Show only first 3 entries when collapsed
      return filteredAndSortedEntries.slice(0, 3);
    }
    return filteredAndSortedEntries.slice(0, visibleCount);
  }, [filteredAndSortedEntries, visibleCount, isExpanded]);

  // Group visible entries by date for rendering
  const visibleGroupedEntries = useMemo(() => {
    const grouped: { [date: string]: Entry[] } = {};
    visibleEntries.forEach((entry) => {
      if (!grouped[entry.entry_date]) {
        grouped[entry.entry_date] = [];
      }
      grouped[entry.entry_date].push(entry);
    });
    return grouped;
  }, [visibleEntries]);

  const hasMoreEntries = visibleCount < filteredAndSortedEntries.length;

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-xl font-serif text-gray-900">All Moments</h3>
            <span className="text-sm text-gray-600">
              {filteredAndSortedEntries.length} {filteredAndSortedEntries.length === 1 ? 'moment' : 'moments'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="p-2 text-gray-600 hover:text-sage hover:bg-sage/10 rounded-lg transition-colors"
                aria-label="Sort by"
              >
                <BarsArrowUpIcon className="w-5 h-5" />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <button
                    onClick={() => {
                      setSortOrder('newest');
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                      sortOrder === 'newest' ? 'text-sage font-medium' : 'text-gray-700'
                    }`}
                  >
                    Newest first
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder('oldest');
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                      sortOrder === 'oldest' ? 'text-sage font-medium' : 'text-gray-700'
                    }`}
                  >
                    Oldest first
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-sage text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
              aria-label="New entry"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search moments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Child Filter Buttons - Always Visible */}
        {children.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedChildFilter(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedChildFilter === null
                    ? 'bg-sage text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All kids
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
        )}

        {filteredAndSortedEntries.length > 0 ? (
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-[5.75rem] top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Timeline entries grouped by date */}
            <div className="space-y-8">
              {Object.entries(visibleGroupedEntries)
                .sort((a, b) => {
                  const dateA = parseLocalDate(a[0]).getTime();
                  const dateB = parseLocalDate(b[0]).getTime();
                  return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                })
                .map(([dateStr, dateEntries]) => {
                  const date = parseLocalDate(dateStr);
                  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const day = date.getDate();

                  return (
                    <div key={dateStr}>
                      {/* Date Header */}
                      <div className="flex items-start gap-6 mb-6">
                        <div className="flex-shrink-0 w-20 text-right pt-1">
                          <div className="text-sm font-medium text-gray-400 tracking-wide">
                            {month} {day}
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-11" />
                        <div className="flex-1" />
                      </div>

                      {/* Entries for this date */}
                      <div className="space-y-6">
                        {dateEntries.map((entry) => {
                          const entryChildren = entry.entry_children?.map((ec: any) => ({
                            id: ec.children.id,
                            name: ec.children.name,
                            photo_url: ec.children.photo_url || null,
                            label_color: ec.children.label_color || null,
                          })) || [];

                          return (
                            <div key={entry.id} className="flex items-start gap-4">
                              {/* Left spacer for date */}
                              <div className="flex-shrink-0 w-20" />

                              {/* Timeline Node */}
                              <TimelineNode
                                children={entryChildren}
                                creatorInitial={
                                  mounted && creatorInfo[entry.created_by]
                                    ? getCreatorInitial(creatorInfo[entry.created_by])
                                    : undefined
                                }
                              />

                              {/* Moment Card */}
                              <div className="flex-1 min-w-0">
                                <MomentCard
                                  content={entry.content}
                                  photoUrl={entry.photo_url}
                                  entryChildren={entry.entry_children}
                                  onEditClick={() => handleEditClick(entry)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Expand/View All Button */}
            {!isExpanded && filteredAndSortedEntries.length > 3 && (
              <div className="flex justify-center mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-sage border-2 border-sage rounded-lg font-medium hover:bg-sage hover:text-white transition-all duration-200"
                >
                  <span>Show More Moments ({filteredAndSortedEntries.length - 3} more)</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
            {isExpanded && hasMoreEntries && (
              <div className="flex flex-col items-center mt-8 pt-6 border-t border-gray-100 gap-2">
                <a
                  href="/timeline"
                  className="px-6 py-3 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200 text-center"
                >
                  View All in Timeline ({filteredAndSortedEntries.length} total moments)
                </a>
                <p className="text-xs text-gray-500">
                  Explore all your memories with advanced filters and search
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">
              {initialEntries.length === 0
                ? 'No moments captured yet. Start your journey today!'
                : searchQuery
                ? `No moments found matching "${searchQuery}"`
                : 'No moments found'}
            </p>
            {(selectedChildFilter || searchQuery) && initialEntries.length > 0 && (
              <button
                onClick={() => {
                  setSelectedChildFilter(null);
                  setSearchQuery('');
                }}
                className="text-sm text-sage hover:underline"
              >
                Clear filters to see all moments
              </button>
            )}
          </div>
        )}
      </div>

      <NewEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEntryCreated={handleEntryCreated}
        children={children}
        familyId={familyId}
        userId={userId}
      />

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
