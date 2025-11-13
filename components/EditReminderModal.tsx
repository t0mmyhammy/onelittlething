'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon, PlusIcon, MinusIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import DeleteConfirmationModal from './DeleteConfirmationModal';

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
  is_completed: boolean;
  is_todo_list: boolean;
  reminder_subtasks: ReminderSubtask[];
}

interface EditReminderModalProps {
  reminder: Reminder;
  children: Child[];
  familyMembers: FamilyMember[];
  userId: string;
  onClose: () => void;
}

const categories = ['Shopping', 'School', 'Health', 'Home', 'Other'];

export default function EditReminderModal({
  reminder,
  children,
  familyMembers,
  userId,
  onClose,
}: EditReminderModalProps) {
  const [title, setTitle] = useState(reminder.title);
  const [notes, setNotes] = useState(reminder.notes || '');
  const [dueDate, setDueDate] = useState(reminder.due_date || '');
  const [assignedTo, setAssignedTo] = useState(reminder.assigned_to || '');
  const [category, setCategory] = useState(reminder.category || '');
  const [linkedChildId, setLinkedChildId] = useState(reminder.linked_child_id || '');
  const [isTodoList, setIsTodoList] = useState(reminder.is_todo_list);
  const [subtasks, setSubtasks] = useState<Array<{ id?: string; title: string; is_completed: boolean; order_index: number }>>(
    reminder.reminder_subtasks || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const supabase = createClient();

  const addSubtask = () => {
    setSubtasks([...subtasks, { title: '', is_completed: false, order_index: subtasks.length }]);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].title = value;
    setSubtasks(newSubtasks);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminder.id);

      if (deleteError) throw deleteError;

      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to delete reminder');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }

      // Update the reminder
      const { error: reminderError } = await supabase
        .from('reminders')
        .update({
          title: title.trim(),
          notes: notes.trim() || null,
          due_date: dueDate || null,
          category: category || null,
          assigned_to: assignedTo || null,
          linked_child_id: linkedChildId || null,
          is_todo_list: isTodoList,
        })
        .eq('id', reminder.id);

      if (reminderError) throw reminderError;

      // Handle subtasks if it's a todo list
      if (isTodoList) {
        // Delete all existing subtasks
        await supabase
          .from('reminder_subtasks')
          .delete()
          .eq('reminder_id', reminder.id);

        // Insert new subtasks
        const validSubtasks = subtasks
          .map((s) => s.title.trim())
          .filter((s) => s.length > 0);

        if (validSubtasks.length > 0) {
          const subtaskData = validSubtasks.map((subtask, index) => ({
            reminder_id: reminder.id,
            title: subtask,
            order_index: index,
          }));

          const { error: subtasksError } = await supabase
            .from('reminder_subtasks')
            .insert(subtaskData);

          if (subtasksError) throw subtasksError;
        }
      }

      // Refresh the page
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to update reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-serif text-gray-900">Edit Reminder</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title - Hero Field */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to remember?"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent placeholder:text-gray-400"
              required
              autoFocus
            />
          </div>

          {/* Notes - Small */}
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (optional)"
              rows={2}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent resize-none placeholder:text-gray-400"
            />
          </div>

          {/* Quick Options - Inline */}
          <div className="flex gap-2">
            {/* Due Date - Small Inline */}
            <div className="flex-1">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>

            {/* Assign To - Small Inline */}
            <div className="flex-1">
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {familyMembers.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user_id === userId
                      ? 'Me'
                      : member.user.email.split('@')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* More Options Toggle */}
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-full justify-center py-2 border-t border-gray-100"
          >
            <span>More options</span>
            {showMoreOptions ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {/* Collapsible Advanced Options */}
          {showMoreOptions && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              {/* Category - Smaller Chips */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(category === cat ? '' : cat)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        category === cat
                          ? 'bg-sage text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link to Child */}
              {children.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Link to Child
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() =>
                          setLinkedChildId(linkedChildId === child.id ? '' : child.id)
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          linkedChildId === child.id
                            ? 'bg-sage text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {child.photo_url && (
                          <img
                            src={child.photo_url}
                            alt={child.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        )}
                        {child.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Convert to To-Do List */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTodoList}
                    onChange={(e) => setIsTodoList(e.target.checked)}
                    className="w-4 h-4 text-sage border-gray-300 rounded focus:ring-sage"
                  />
                  <span className="text-xs font-medium text-gray-600">
                    Convert to To-Do List with subtasks
                  </span>
                </label>
              </div>

              {/* Subtasks */}
              {isTodoList && (
                <div className="space-y-2 pl-6">
                  {subtasks.map((subtask, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={subtask.title}
                        onChange={(e) => updateSubtask(index, e.target.value)}
                        placeholder={`Subtask ${index + 1}`}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                      />
                      {subtasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubtask(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="flex items-center gap-1.5 text-xs text-sage hover:text-sage/80 transition-colors"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add subtask
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                loading || !title.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-sage hover:opacity-90'
              }`}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          title="Delete Reminder?"
          message="Are you sure you want to delete this reminder? This action cannot be undone."
          confirmLabel="Delete Reminder"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
