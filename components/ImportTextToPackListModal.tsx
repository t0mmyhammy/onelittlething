'use client';

import { useState } from 'react';
import { XMarkIcon, SparklesIcon, CheckIcon, XMarkIcon as RemoveIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ParsedItem {
  label: string;
  quantity?: string;
}

interface ParsedCategory {
  title: string;
  items: ParsedItem[];
}

interface ImportTextToPackListModalProps {
  familyId: string;
  userId: string;
  onClose: () => void;
}

export default function ImportTextToPackListModal({
  familyId,
  userId,
  onClose,
}: ImportTextToPackListModalProps) {
  const [inputText, setInputText] = useState('');
  const [packListName, setPackListName] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [parsedCategories, setParsedCategories] = useState<ParsedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');
  const router = useRouter();

  const handleParse = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to parse');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/parse-pack-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse text');
      }

      const data = await response.json();
      setParsedCategories(data.categories || []);
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to parse pack list from text');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCategory = (index: number) => {
    setParsedCategories(parsedCategories.filter((_, i) => i !== index));
  };

  const handleRemoveItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...parsedCategories];
    updated[categoryIndex].items = updated[categoryIndex].items.filter((_, i) => i !== itemIndex);
    setParsedCategories(updated);
  };

  const handleEditCategoryTitle = (index: number, value: string) => {
    const updated = [...parsedCategories];
    updated[index].title = value;
    setParsedCategories(updated);
  };

  const handleEditItem = (categoryIndex: number, itemIndex: number, field: 'label' | 'quantity', value: string) => {
    const updated = [...parsedCategories];
    updated[categoryIndex].items[itemIndex] = {
      ...updated[categoryIndex].items[itemIndex],
      [field]: value,
    };
    setParsedCategories(updated);
  };

  const handleImport = async () => {
    if (!packListName.trim()) {
      setError('Please enter a pack list name');
      return;
    }

    if (parsedCategories.length === 0) {
      setError('No categories to import');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/import-pack-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          userId,
          packListName: packListName.trim(),
          durationDays: durationDays ? parseInt(durationDays) : null,
          categories: parsedCategories,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to import pack list');
      }

      const data = await response.json();

      // Redirect to the new pack list
      router.push(`/pack-lists/${data.packListId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to import pack list');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-sage" />
            <h2 className="text-xl font-serif text-gray-900">
              {step === 'input' ? 'Import Pack List from Text' : 'Review & Customize'}
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
                Paste a packing list from emails, notes, or any text—AI will organize it into categories and items.
              </p>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Example:&#10;&#10;Clothing:&#10;- T-shirts (3)&#10;- Shorts (2)&#10;- Pajamas&#10;- Swimsuit&#10;&#10;Toiletries:&#10;- Toothbrush&#10;- Sunscreen&#10;- Shampoo&#10;&#10;Or just paste your list and AI will categorize it for you!"
                rows={14}
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
              <div className="space-y-4 mb-4">
                {/* Pack List Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pack List Name *
                  </label>
                  <input
                    type="text"
                    value={packListName}
                    onChange={(e) => setPackListName(e.target.value)}
                    placeholder="e.g., Beach vacation essentials"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="e.g., 3"
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {parsedCategories.length} {parsedCategories.length === 1 ? 'category' : 'categories'} found. Review and edit before importing.
              </p>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {parsedCategories.map((category, catIndex) => (
                  <div
                    key={catIndex}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={category.title}
                        onChange={(e) => handleEditCategoryTitle(catIndex, e.target.value)}
                        className="font-medium text-gray-900 border-none focus:outline-none focus:ring-2 focus:ring-sage rounded px-2 py-1"
                      />
                      <button
                        onClick={() => handleRemoveCategory(catIndex)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove category"
                      >
                        <RemoveIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckIcon className="w-4 h-4 text-sage flex-shrink-0" />
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleEditItem(catIndex, itemIndex, 'label', e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-sage focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={item.quantity || ''}
                            onChange={(e) => handleEditItem(catIndex, itemIndex, 'quantity', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-sage focus:border-transparent text-center"
                            placeholder="Qty"
                          />
                          <button
                            onClick={() => handleRemoveItem(catIndex, itemIndex)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove item"
                          >
                            <RemoveIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
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
                  disabled={loading || !packListName.trim() || parsedCategories.length === 0}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                    loading || !packListName.trim() || parsedCategories.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-sage hover:opacity-90'
                  }`}
                >
                  {loading ? 'Importing...' : 'Create Pack List'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
