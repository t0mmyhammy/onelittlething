'use client';

import { useState } from 'react';
import { XMarkIcon, SparklesIcon, CheckIcon, XMarkIcon as RemoveIcon } from '@heroicons/react/24/outline';

interface ParsedReminder {
  title: string;
  notes?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface ImportTextToRemindersModalProps {
  familyId: string;
  userId: string;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function ImportTextToRemindersModal({
  familyId,
  userId,
  onClose,
  onImportComplete,
}: ImportTextToRemindersModalProps) {
  const [inputText, setInputText] = useState('');
  const [parsedReminders, setParsedReminders] = useState<ParsedReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');

  const handleParse = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to parse');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/parse-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse text');
      }

      const data = await response.json();
      setParsedReminders(data.reminders || []);
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to parse reminders from text');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveReminder = (index: number) => {
    setParsedReminders(parsedReminders.filter((_, i) => i !== index));
  };

  const handleEditReminder = (index: number, field: keyof ParsedReminder, value: string) => {
    const updated = [...parsedReminders];
    updated[index] = { ...updated[index], [field]: value };
    setParsedReminders(updated);
  };

  const handleImport = async () => {
    if (parsedReminders.length === 0) {
      setError('No reminders to import');
      return;
    }

    if (!familyId || familyId.trim() === '') {
      setError('Error: No family ID found. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/import-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          userId,
          reminders: parsedReminders,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to import reminders');
      }

      const data = await response.json();
      console.log('Successfully imported reminders:', data);

      onImportComplete();
    } catch (err: any) {
      console.error('Import reminders error:', err);
      setError(err.message || 'Failed to import reminders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-sage" />
            <h2 className="text-xl font-serif text-gray-900">
              {step === 'input' ? 'Import from Text' : 'Review Reminders'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {step === 'input' ? (
            <>
              <p className="text-gray-600 text-sm mb-4">
                Paste any text—emails, meeting notes, voice transcriptions—and AI will extract action items into reminders.
              </p>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Example:&#10;&#10;Need to order snow boots for the kids before next week&#10;Schedule dentist appointment for Emma&#10;Pick up groceries - milk, eggs, bread&#10;Call school about field trip permission slip"
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent resize-none text-sm"
                autoFocus
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParse}
                  disabled={loading || !inputText.trim()}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                    loading || !inputText.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-sage hover:opacity-90'
                  }`}
                >
                  <SparklesIcon className="w-4 h-4" />
                  {loading ? 'Parsing...' : 'Parse with AI'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-sm mb-4">
                {parsedReminders.length} reminder{parsedReminders.length !== 1 ? 's' : ''} found. Review and edit before importing.
              </p>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {parsedReminders.map((reminder, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-sage/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={reminder.title}
                          onChange={(e) => handleEditReminder(index, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                          placeholder="Reminder title"
                        />
                        {reminder.notes && (
                          <input
                            type="text"
                            value={reminder.notes}
                            onChange={(e) => handleEditReminder(index, 'notes', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                            placeholder="Notes (optional)"
                          />
                        )}
                        {reminder.category && (
                          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {reminder.category}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveReminder(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <RemoveIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={loading || parsedReminders.length === 0}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                    loading || parsedReminders.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-sage hover:opacity-90'
                  }`}
                >
                  {loading ? 'Importing...' : `Import ${parsedReminders.length} Reminder${parsedReminders.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
