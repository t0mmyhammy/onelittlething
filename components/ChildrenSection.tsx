'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddChildModal from './AddChildModal';
import EditChildModal from './EditChildModal';
import { calculateAge } from '@/lib/utils/age';
import { formatHumanDate } from '@/lib/utils/dateFormat';
import { getColorClasses } from '@/lib/labelColors';
import { CalendarIcon, CakeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  photo_url: string | null;
  label_color?: string | null;
  created_at: string;
  family_id?: string;
  archived?: boolean | null;
}

interface ChildrenSectionProps {
  initialChildren: Child[];
  familyId: string;
}

export default function ChildrenSection({ initialChildren, familyId }: ChildrenSectionProps) {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const handleChildAdded = () => {
    // Refresh server data without losing URL hash
    router.refresh();
  };

  const handleChildUpdated = () => {
    // Refresh server data without losing URL hash
    router.refresh();
  };

  const handleEditClick = (child: Child) => {
    setSelectedChild(child);
    setIsEditModalOpen(true);
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Your Children</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 rounded-full bg-rose/10 hover:bg-rose/20 flex items-center justify-center text-rose transition-all hover:scale-105"
            aria-label="Add child"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {children && children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.filter(child => !child.archived).map((child) => {
              // Parse date string directly to avoid timezone issues
              const parseLocalDate = (dateString: string): Date => {
                const [year, month, day] = dateString.split('-').map(Number);
                return new Date(year, month - 1, day);
              };

              const birthDate = child.birthdate ? parseLocalDate(child.birthdate) : null;
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              // Set both to midnight for accurate comparison
              today.setHours(0, 0, 0, 0);
              if (birthDate) birthDate.setHours(0, 0, 0, 0);
              const isUnborn = birthDate && birthDate >= today;
              const age = calculateAge(child.birthdate);

              // Get label color classes
              const colors = getColorClasses(child.label_color || 'yellow');

              return (
                <button
                  key={child.id}
                  onClick={() => handleEditClick(child)}
                  style={{ backgroundColor: colors.hex }}
                  className={`w-full p-4 rounded-2xl shadow-sm hover:shadow-md transition-all relative text-left group active:scale-[0.98]`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{child.name}</h4>
                      {isUnborn && child.birthdate && (() => {
                        const diffTime = birthDate!.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return (
                          <>
                            <div className="flex items-center gap-2 mt-1.5">
                              <CalendarIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                              <p className="text-sm text-gray-600 truncate">
                                Due {formatHumanDate(child.birthdate)}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {diffDays} {diffDays === 1 ? 'day' : 'days'} until due
                            </p>
                          </>
                        );
                      })()}
                      {!isUnborn && child.birthdate && (
                        <>
                          <div className="flex items-center gap-2 mt-1.5">
                            <CakeIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <p className="text-sm text-gray-600 truncate">
                              {formatHumanDate(child.birthdate)}
                            </p>
                          </div>
                          {age && (
                            <p className="text-xs text-gray-500 mt-1">
                              {age} old
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {/* Avatar with initials or photo */}
                      {child.photo_url ? (
                        <img
                          src={child.photo_url}
                          alt={child.name}
                          className="w-14 h-14 rounded-full object-cover object-center border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-rose/20 border-2 border-white shadow-sm flex items-center justify-center">
                          <span className="text-rose font-semibold text-lg">
                            {getInitials(child.name)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <UserCircleIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">No children yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Add your first child to start tracking their special moments
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose/10 text-rose rounded-lg hover:bg-rose/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Child
            </button>
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
