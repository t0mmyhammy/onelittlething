'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircleIcon, CalendarIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

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

interface ReminderCardProps {
  reminder: Reminder;
  children: Child[];
  familyMembers: FamilyMember[];
  userId: string;
}

export default function ReminderCard({
  reminder,
  children,
  familyMembers,
  userId,
}: ReminderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const supabase = createClient();

  const handleToggleComplete = async () => {
    setIsCompleting(true);
    try {
      await supabase
        .from('reminders')
        .update({
          is_completed: !reminder.is_completed,
          completed_at: !reminder.is_completed ? new Date().toISOString() : null,
        })
        .eq('id', reminder.id);

      window.location.reload();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('reminder_subtasks')
        .update({ is_completed: !currentStatus })
        .eq('id', subtaskId);

      window.location.reload();
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  // Find linked child
  const linkedChild = reminder.linked_child_id
    ? children.find((c) => c.id === reminder.linked_child_id)
    : null;

  // Find assigned user
  const assignedMember = reminder.assigned_to
    ? familyMembers.find((m) => m.user_id === reminder.assigned_to)
    : null;

  // Get due date info
  const getDueDateInfo = () => {
    if (!reminder.due_date) return null;

    const dueDate = new Date(reminder.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-amber-600', bgColor: 'bg-amber-50' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    } else {
      return {
        text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
      };
    }
  };

  const dueDateInfo = getDueDateInfo();

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all ${
        reminder.is_completed
          ? 'border-gray-200 opacity-60'
          : 'border-sage/20 hover:border-sage/40'
      }`}
    >
      <div className="p-4">
        {/* Main Row */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={isCompleting}
            className="flex-shrink-0 mt-0.5"
          >
            {reminder.is_completed ? (
              <CheckCircleSolid className="w-6 h-6 text-sage" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-gray-300 hover:text-sage transition-colors" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`text-base font-medium ${
                  reminder.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {reminder.title}
              </h3>
              {!reminder.is_completed && reminder.is_todo_list && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              {/* Due Date */}
              {dueDateInfo && (
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded ${dueDateInfo.bgColor} ${dueDateInfo.color} text-xs font-medium`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dueDateInfo.text}
                </span>
              )}

              {/* Linked Child */}
              {linkedChild && (
                <span className="flex items-center gap-1.5 text-gray-600">
                  {linkedChild.photo_url ? (
                    <img
                      src={linkedChild.photo_url}
                      alt={linkedChild.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                  )}
                  <span className="text-xs">{linkedChild.name}</span>
                </span>
              )}

              {/* Category */}
              {reminder.category && (
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <TagIcon className="w-3.5 h-3.5" />
                  {reminder.category}
                </span>
              )}

              {/* Assigned To */}
              {assignedMember && (
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                  {assignedMember.user_id === userId
                    ? 'Me'
                    : assignedMember.user.email.split('@')[0]}
                </span>
              )}
            </div>

            {/* Notes (if expanded or no subtasks) */}
            {reminder.notes && (isExpanded || !reminder.is_todo_list) && (
              <p className="mt-2 text-sm text-gray-600">{reminder.notes}</p>
            )}
          </div>
        </div>

        {/* Subtasks (if expanded and is_todo_list) */}
        {isExpanded && reminder.is_todo_list && reminder.reminder_subtasks.length > 0 && (
          <div className="mt-4 ml-9 space-y-2">
            {reminder.reminder_subtasks
              .sort((a, b) => a.order_index - b.order_index)
              .map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSubtask(subtask.id, subtask.is_completed)}
                    className="flex-shrink-0"
                  >
                    {subtask.is_completed ? (
                      <CheckCircleSolid className="w-5 h-5 text-sage" />
                    ) : (
                      <CheckCircleIcon className="w-5 h-5 text-gray-300 hover:text-sage transition-colors" />
                    )}
                  </button>
                  <span
                    className={`text-sm ${
                      subtask.is_completed ? 'line-through text-gray-500' : 'text-gray-700'
                    }`}
                  >
                    {subtask.title}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
