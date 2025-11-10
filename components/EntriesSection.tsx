'use client';

import { useState, useMemo } from 'react';
import NewEntryModal from './NewEntryModal';
import EditEntryModal from './EditEntryModal';
import { PencilIcon, BarsArrowUpIcon, PencilSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getColorClasses } from '@/lib/labelColors';

// Helper to parse date string without timezone conversion
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
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
            {/* Timeline vertical line - mobile: thin line on left, desktop: centered */}
            <div className="absolute left-2.5 md:left-[94px] top-3 bottom-3 w-[1px] md:w-0.5 bg-gradient-to-b from-sage/40 via-sage/20 to-transparent" />

            {/* Timeline entries grouped by date */}
            <div className="space-y-6 md:space-y-8">
              {Object.entries(groupedEntries)
                .sort((a, b) => {
                  const dateA = parseLocalDate(a[0]).getTime();
                  const dateB = parseLocalDate(b[0]).getTime();
                  return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                })
                .map(([dateStr, dateEntries]) => {
                  const date = parseLocalDate(dateStr);
                  const shortDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const fullDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  const hasMultiple = dateEntries.length > 1;

                  return (
                    <div key={dateStr} className="relative">
                      {/* Mobile: Timeline node + date on left side */}
                      <div className="md:hidden flex items-start gap-3 mb-3">
                        {/* Timeline node on the line */}
                        <div className="flex-shrink-0 relative z-10 mt-1">
                          <div className="w-2 h-2 rounded-full bg-sage ring-2 ring-cream shadow-sm" />
                        </div>
                        <div className="text-sm font-semibold text-gray-700 pt-0.5">
                          {shortDate}
                        </div>
                      </div>

                      {/* Desktop: Date + Timeline layout */}
                      <div className="hidden md:flex gap-4">
                        {/* Date on the left */}
                        <div className="flex-shrink-0 w-20 pt-1 text-right">
                          <div className="text-sm font-medium text-gray-700">{shortDate}</div>
                        </div>

                        {/* Timeline node - perfectly centered on the line */}
                        <div className="flex-shrink-0 relative z-10 -ml-1.5">
                          <div className="w-3 h-3 rounded-full bg-sage ring-4 ring-cream mt-1.5 shadow-sm" />
                        </div>

                        {/* Entry content(s) */}
                        <div className="flex-1 pb-2 min-w-0">
                          <div className={`flex flex-wrap gap-3 ${hasMultiple ? '' : ''}`}>
                            {dateEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className={`group ${
                                hasMultiple
                                  ? 'w-full sm:flex-1 sm:min-w-[280px] sm:max-w-[calc(50%-0.375rem)]'
                                  : 'w-full'
                              }`}
                            >
                              <div className="bg-white border border-sand rounded-xl p-4 hover:border-sage hover:shadow-sm transition-all h-full">
                                <div className="flex justify-between items-start gap-3 mb-3">
                                  <div className="flex gap-2 flex-wrap">
                                    {entry.entry_children?.map((ec: any) => {
                                      const colors = getColorClasses(ec.children.label_color || undefined);
                                      return (
                                        <span
                                          key={ec.children.id}
                                          style={{ backgroundColor: colors.hex }}
                                          className={`text-xs px-2.5 py-1 rounded-full ${colors.text} font-medium`}
                                        >
                                          {ec.children.name}
                                        </span>
                                      );
                                    })}
                                  </div>
                                  <button
                                    onClick={() => handleEditClick(entry)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-sage flex-shrink-0"
                                    aria-label="Edit moment"
                                    title={fullDate}
                                  >
                                    <PencilIcon className="w-5 h-5" />
                                  </button>
                                </div>
                                <p className="text-gray-800 leading-relaxed">{entry.content}</p>
                              </div>
                            </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Mobile: Full-width entries with left padding for timeline */}
                      <div className="md:hidden space-y-3 pl-7">
                          {dateEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="group bg-white border border-sand rounded-xl p-4 hover:border-sage hover:shadow-sm transition-all"
                            >
                              <div className="flex justify-between items-start gap-3 mb-3">
                                <div className="flex gap-2 flex-wrap">
                                  {entry.entry_children?.map((ec: any) => {
                                    const colors = getColorClasses(ec.children.label_color || undefined);
                                    return (
                                      <span
                                        key={ec.children.id}
                                        style={{ backgroundColor: colors.hex }}
                                        className={`text-xs px-2.5 py-1 rounded-full ${colors.text} font-medium`}
                                      >
                                        {ec.children.name}
                                      </span>
                                    );
                                  })}
                                </div>
                                <button
                                  onClick={() => handleEditClick(entry)}
                                  className="text-gray-400 hover:text-sage flex-shrink-0"
                                  aria-label="Edit moment"
                                  title={fullDate}
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                              </div>
                              <p className="text-gray-800 leading-relaxed">{entry.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
            </div>
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
