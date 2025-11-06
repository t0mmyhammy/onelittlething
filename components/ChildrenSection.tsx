'use client';

import { useState } from 'react';
import AddChildModal from './AddChildModal';
import EditChildModal from './EditChildModal';
import { calculateAge } from '@/lib/utils/age';
import { formatHumanDate } from '@/lib/utils/dateFormat';
import { CalendarIcon, CakeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  photo_url: string | null;
  created_at: string;
  family_id?: string;
}

interface ChildrenSectionProps {
  initialChildren: Child[];
  familyId: string;
}

export default function ChildrenSection({ initialChildren, familyId }: ChildrenSectionProps) {
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const handleChildAdded = () => {
    // Refresh the page to show new child
    window.location.reload();
  };

  const handleChildUpdated = () => {
    // Refresh the page to show updated child
    window.location.reload();
  };

  const handleEditClick = (child: Child) => {
    setSelectedChild(child);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-serif text-gray-900">Your Children</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-rose text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add Child
          </button>
        </div>

        {children && children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => {
              // Parse date string directly to avoid timezone issues
              const parseLocalDate = (dateString: string): Date => {
                const [year, month, day] = dateString.split('-').map(Number);
                return new Date(year, month - 1, day);
              };
              
              const birthDate = child.birthdate ? parseLocalDate(child.birthdate) : null;
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const isUnborn = birthDate && birthDate > today;
              const age = calculateAge(child.birthdate);
              
              // Determine background color based on gender
              const getBackgroundColor = () => {
                if (child.gender === 'boy') return 'bg-blue-50';
                if (child.gender === 'girl') return 'bg-pink-50';
                return 'bg-white';
              };

              return (
                <div
                  key={child.id}
                  className={`p-4 border border-sand rounded-lg hover:border-rose transition-colors relative group ${getBackgroundColor()}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{child.name}</h4>
                      {isUnborn && child.birthdate && (() => {
                        const diffTime = birthDate!.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return (
                          <>
                            <div className="flex items-center gap-2 mt-1">
                              <CalendarIcon className="w-4 h-4 text-gray-600" />
                              <p className="text-sm text-gray-600">
                                Due {formatHumanDate(child.birthdate)}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {diffDays} {diffDays === 1 ? 'day' : 'days'}
                            </p>
                          </>
                        );
                      })()}
                      {!isUnborn && child.birthdate && (
                        <>
                          <div className="flex items-center gap-2 mt-1">
                            <CakeIcon className="w-4 h-4 text-gray-600" />
                            <p className="text-sm text-gray-600">
                              {formatHumanDate(child.birthdate)}
                            </p>
                          </div>
                          {age && (
                            <p className="text-xs text-gray-400 mt-1">
                              {age} old
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Photo placeholder or silhouette */}
                      {child.photo_url ? (
                        <img
                          src={child.photo_url}
                          alt={child.name}
                          className="w-12 h-12 rounded-full object-cover object-center border-2 border-sand"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-sand flex items-center justify-center">
                          <UserCircleIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => handleEditClick(child)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-rose"
                        aria-label="Edit child"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No children added yet</p>
            <p className="text-sm text-gray-400">
              Add your first child to start capturing moments
            </p>
          </div>
        )}
      </div>

      <AddChildModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onChildAdded={handleChildAdded}
        familyId={familyId}
      />

      <EditChildModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedChild(null);
        }}
        onChildUpdated={handleChildUpdated}
        child={selectedChild}
      />
    </>
  );
}
