'use client';

import { useState, useMemo } from 'react';
import NewEntryModal from './NewEntryModal';
import EditEntryModal from './EditEntryModal';
import { PencilIcon, FunnelIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
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
  const [showFilters, setShowFilters] = useState(false);

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
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-xl font-serif text-gray-900">All Moments</h3>
            <span className="text-sm text-gray-600">
              {filteredAndSortedEntries.length} {filteredAndSortedEntries.length === 1 ? 'moment' : 'moments'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:text-sage hover:bg-sage/10 rounded-lg transition-colors"
              aria-label="Toggle filters"
            >
              <FunnelIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-sage text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
              aria-label="New entry"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          {(selectedChildFilter || sortOrder !== 'newest') && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedChildFilter(null);
                  setSortOrder('newest');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
              {/* Child Filter */}
              {children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by child:
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedChildFilter(null)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by date:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder('newest')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      sortOrder === 'newest'
                        ? 'bg-sage text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Newest first
                  </button>
                  <button
                    onClick={() => setSortOrder('oldest')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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

        {filteredAndSortedEntries.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 border border-sand rounded-lg hover:border-sage transition-colors group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 flex-wrap">
                    {entry.entry_children?.map((ec: any) => {
                      const colors = getColorClasses(ec.children.label_color);
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
                      {parseLocalDate(entry.entry_date).toLocaleDateString()}
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
            <p className="text-gray-500 mb-2">
              {initialEntries.length === 0
                ? 'No moments captured yet. Start your journey today!'
                : 'No moments found'}
            </p>
            {selectedChildFilter && initialEntries.length > 0 && (
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
