'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ReminderCard from './ReminderCard';
import CreateReminderModal from './CreateReminderModal';

interface Child {
  id: string;
  name: string;
  photo_url: string | null;
}

interface FamilyMember {
  user_id: string;
  role: string;
  user: {
    id: string;
    email: string;
  };
}

interface ReminderSubtask {
  id: string;
  reminder_id: string;
  title: string;
  is_completed: boolean;
  order_index: number;
}

interface Reminder {
  id: string;
  family_id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  category: string | null;
  assigned_to: string | null;
  created_by: string;
  linked_child_id: string | null;
  linked_need_id: string | null;
  is_completed: boolean;
  completed_at: string | null;
  is_todo_list: boolean;
  created_at: string;
  updated_at: string;
  reminder_subtasks: ReminderSubtask[];
}

interface RemindersViewProps {
  initialReminders: Reminder[];
  children: Child[];
  familyId: string;
  userId: string;
  familyMembers: FamilyMember[];
}

type FilterType = 'all' | 'mine' | 'partner' | 'completed';

export default function RemindersView({
  initialReminders,
  children,
  familyId,
  userId,
  familyMembers,
}: RemindersViewProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter reminders based on selected tab
  const filteredReminders = initialReminders.filter((reminder) => {
    if (filter === 'completed') {
      return reminder.is_completed;
    }
    if (filter === 'mine') {
      return !reminder.is_completed && reminder.assigned_to === userId;
    }
    if (filter === 'partner') {
      return !reminder.is_completed && reminder.assigned_to !== userId && reminder.assigned_to !== null;
    }
    // 'all' - show all non-completed
    return !reminder.is_completed;
  });

  // Sort reminders: overdue, due today, future, no due date
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const aDate = a.due_date ? new Date(a.due_date) : null;
    const bDate = b.due_date ? new Date(b.due_date) : null;

    // No due date goes to the end
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    // Both have due dates - compare
    return aDate.getTime() - bDate.getTime();
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'mine', 'partner', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-sage text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">New Reminder</span>
          </button>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {sortedReminders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {filter === 'completed'
                  ? 'No completed reminders yet'
                  : filter === 'mine'
                  ? 'No reminders assigned to you'
                  : filter === 'partner'
                  ? 'No reminders assigned to your partner'
                  : 'No reminders yet'}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-sage text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create your first reminder
                </button>
              )}
            </div>
          ) : (
            sortedReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                children={children}
                familyMembers={familyMembers}
                userId={userId}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <CreateReminderModal
          familyId={familyId}
          userId={userId}
          children={children}
          familyMembers={familyMembers}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
