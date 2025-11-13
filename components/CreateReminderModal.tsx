'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

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

interface CreateReminderModalProps {
  familyId: string;
  userId: string;
  children: Child[];
  familyMembers: FamilyMember[];
  onClose: () => void;
}

const categories = ['Shopping', 'School', 'Health', 'Home', 'Other'];

export default function CreateReminderModal({
  familyId,
  userId,
  children,
  familyMembers,
  onClose,
}: CreateReminderModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [linkedChildId, setLinkedChildId] = useState<string>('');
  const [isTodoList, setIsTodoList] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const addSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }

      // Create the reminder
      const { data: reminder, error: reminderError } = await supabase
        .from('reminders')
        .insert({
          family_id: familyId,
          created_by: userId,
          title: title.trim(),
          notes: notes.trim() || null,
          due_date: dueDate || null,
          category: category || null,
          assigned_to: assignedTo || null,
          linked_child_id: linkedChildId || null,
          is_todo_list: isTodoList,
        })
        .select()
        .single();

      if (reminderError) throw reminderError;

      // If it's a todo list, create subtasks
      if (isTodoList && reminder) {
        const validSubtasks = subtasks
          .map((s) => s.trim())
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
      setError(err.message || 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-serif text-gray-900">New Reminder</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Order new snow boots"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? '' : cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat
                      ? 'bg-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
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

          {/* Link to Child */}
          {children.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Child
              </label>
              <div className="flex flex-wrap gap-2">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() =>
                      setLinkedChildId(linkedChildId === child.id ? '' : child.id)
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      linkedChildId === child.id
                        ? 'bg-sage text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {child.photo_url && (
                      <img
                        src={child.photo_url}
                        alt={child.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    )}
                    {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Convert to To-Do List */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTodoList}
                onChange={(e) => setIsTodoList(e.target.checked)}
                className="w-5 h-5 text-sage border-gray-300 rounded focus:ring-sage"
              />
              <span className="text-sm font-medium text-gray-700">
                Convert to To-Do List with subtasks
              </span>
            </label>
          </div>

          {/* Subtasks */}
          {isTodoList && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Subtasks
              </label>
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={subtask}
                    onChange={(e) => updateSubtask(index, e.target.value)}
                    placeholder={`Subtask ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                  {subtasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSubtask}
                className="flex items-center gap-2 text-sm text-sage hover:text-sage/80 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add subtask
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                loading || !title.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-sage hover:opacity-90'
              }`}
            >
              {loading ? 'Creating...' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
