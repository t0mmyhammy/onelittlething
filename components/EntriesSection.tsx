'use client';

import { useState } from 'react';
import NewEntryModal from './NewEntryModal';

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
    };
  }>;
}

interface EntriesSectionProps {
  initialEntries: Entry[];
  children: Child[];
  familyId: string;
  userId: string;
}

export default function EntriesSection({
  initialEntries,
  children,
  familyId,
  userId,
}: EntriesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEntryCreated = () => {
    // Refresh the page to show new entry
    window.location.reload();
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-serif text-gray-900">Recent Moments</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-sage text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            New Entry
          </button>
        </div>

        {initialEntries && initialEntries.length > 0 ? (
          <div className="space-y-4">
            {initialEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 border border-sand rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 flex-wrap">
                    {entry.entry_children?.map((ec: any) => (
                      <span
                        key={ec.children.id}
                        className="text-xs bg-amber px-2 py-1 rounded-full"
                      >
                        {ec.children.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.entry_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{entry.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No moments captured yet. Start your journey today!
          </p>
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
    </>
  );
}
