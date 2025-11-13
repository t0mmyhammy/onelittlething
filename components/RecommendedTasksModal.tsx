'use client';

import { useState } from 'react';
import { XMarkIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { RecommendedTask } from '@/lib/baby-prep-templates';

interface RecommendedTasksModalProps {
  category: string;
  categoryTitle: string;
  recommendedTasks: RecommendedTask[];
  onClose: () => void;
  onAddTasks: (tasks: RecommendedTask[]) => void;
}

export default function RecommendedTasksModal({
  category,
  categoryTitle,
  recommendedTasks,
  onClose,
  onAddTasks,
}: RecommendedTasksModalProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map((_, i) => i)));
    }
  };

  const handleAddSelected = () => {
    const tasksToAdd = filteredTasks.filter((_, i) => selectedTasks.has(i));
    onAddTasks(tasksToAdd);
    onClose();
  };

  const handleAddSingle = (task: RecommendedTask) => {
    onAddTasks([task]);
  };

  const filteredTasks = recommendedTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <InformationCircleIcon className="w-6 h-6 text-sage" />
            <div>
              <h2 className="text-xl font-serif text-gray-900">
                Recommended Tasks
              </h2>
              <p className="text-sm text-gray-500">{categoryTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search & Select All */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent mb-3"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="text-sm text-sage hover:text-sage/80 font-medium"
            >
              {selectedTasks.size === filteredTasks.length ? 'Deselect All' : 'Select All'}
            </button>
            <p className="text-sm text-gray-600">
              {selectedTasks.size} of {filteredTasks.length} selected
            </p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedTasks.has(index)
                      ? 'border-sage bg-sage/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(index)}
                      onChange={() => toggleTask(index)}
                      className="w-5 h-5 text-sage border-gray-300 rounded focus:ring-sage cursor-pointer mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 flex-1">
                          {task.title}
                        </h3>
                        <button
                          onClick={() => handleAddSingle(task)}
                          className="text-xs bg-sage text-white px-3 py-1 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                          Add to my list
                        </button>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {task.timeline}
                        </span>
                        {task.priority && (
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                          </span>
                        )}
                        {task.context === 'second_plus' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            With Older Children
                          </span>
                        )}
                        {task.context === 'first_baby' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            First Baby
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedTasks.size === 0}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2 ${
                selectedTasks.size === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-sage hover:opacity-90'
              }`}
            >
              <CheckIcon className="w-4 h-4" />
              Add {selectedTasks.size > 0 ? `${selectedTasks.size} ` : ''}Selected Task{selectedTasks.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
