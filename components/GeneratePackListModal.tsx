'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon, SparklesIcon, CheckIcon, XMarkIcon as RemoveIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
}

interface GeneratedItem {
  label: string;
  quantity?: string;
}

interface GeneratedCategory {
  title: string;
  items: GeneratedItem[];
}

interface GeneratePackListModalProps {
  familyId: string;
  userId: string;
  children: Child[];
  onClose: () => void;
}

export default function GeneratePackListModal({
  familyId,
  userId,
  children,
  onClose,
}: GeneratePackListModalProps) {
  const [tripType, setTripType] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [packListName, setPackListName] = useState('');
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [generatedCategories, setGeneratedCategories] = useState<GeneratedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');
  const router = useRouter();
  const supabase = createClient();

  const toggleChild = (childId: string) => {
    setSelectedChildren(prev =>
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const handleGenerate = async () => {
    if (!tripType.trim()) {
      setError('Please describe your trip');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-pack-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripType: tripType.trim(),
          durationDays: durationDays ? parseInt(durationDays) : null,
          familyId,
          children: children.map(child => ({
            name: child.name,
            birthdate: child.birthdate,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate pack list');
      }

      const data = await response.json();
      setGeneratedCategories(data.categories || []);

      // Auto-fill pack list name if not already set
      if (!packListName.trim()) {
        setPackListName(tripType.trim());
      }

      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to generate pack list');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCategory = (index: number) => {
    setGeneratedCategories(generatedCategories.filter((_, i) => i !== index));
  };

  const handleRemoveItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...generatedCategories];
    updated[categoryIndex].items = updated[categoryIndex].items.filter((_, i) => i !== itemIndex);
    setGeneratedCategories(updated);
  };

  const handleEditCategoryTitle = (index: number, value: string) => {
    const updated = [...generatedCategories];
    updated[index].title = value;
    setGeneratedCategories(updated);
  };

  const handleEditItem = (categoryIndex: number, itemIndex: number, field: 'label' | 'quantity', value: string) => {
    const updated = [...generatedCategories];
    updated[categoryIndex].items[itemIndex] = {
      ...updated[categoryIndex].items[itemIndex],
      [field]: value,
    };
    setGeneratedCategories(updated);
  };

  const handleCreate = async () => {
    if (!packListName.trim()) {
      setError('Please enter a pack list name');
      return;
    }

    if (generatedCategories.length === 0) {
      setError('No categories to create');
      return;
    }

    if (!familyId || familyId.trim() === '') {
      setError('Error: No family ID found. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create the pack list
      const { data: packList, error: packListError } = await supabase
        .from('pack_lists')
        .insert({
          family_id: familyId,
          created_by_user_id: userId,
          name: packListName.trim(),
          duration_days: durationDays ? parseInt(durationDays) : null,
          participants: selectedChildren,
        })
        .select()
        .single();

      if (packListError) {
        console.error('Generate pack list error:', packListError);
        throw packListError;
      }

      if (!packList?.id) {
        throw new Error('Pack list created but ID not returned');
      }

      // Create categories with items
      for (let i = 0; i < generatedCategories.length; i++) {
        const category = generatedCategories[i];

        // Create category
        const { data: newCategory, error: categoryError } = await supabase
          .from('pack_list_categories')
          .insert({
            pack_list_id: packList.id,
            title: category.title,
            order_index: i,
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        // Create items for this category
        if (category.items.length > 0) {
          const itemsData = category.items.map((item, j) => ({
            category_id: newCategory.id,
            label: item.label,
            quantity: item.quantity || null,
            is_complete: false,
            order_index: j,
          }));

          const { error: itemsError } = await supabase
            .from('pack_list_items')
            .insert(itemsData);

          if (itemsError) throw itemsError;
        }
      }

      // Redirect to the pack list detail page
      router.push(`/pack-lists/${packList.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Generate pack list error:', err);
      setError(err.message || 'Failed to create pack list');
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
              {step === 'input' ? 'Generate Pack List' : 'Review & Customize'}
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
                Describe your trip and AI will generate a comprehensive packing list tailored to your children's ages.
              </p>

              <div className="space-y-4">
                {/* Trip Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Type *
                  </label>
                  <input
                    type="text"
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                    placeholder="e.g., Beach vacation, Camping weekend, Ski trip, Visit grandparents"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                    autoFocus
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

                {/* Who's Going */}
                {children.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who's going on this trip?
                    </label>
                    <div className="space-y-2">
                      {children.map((child) => (
                        <label
                          key={child.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedChildren.includes(child.id)}
                            onChange={() => toggleChild(child.id)}
                            className="w-4 h-4 text-sage focus:ring-sage border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{child.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !tripType.trim()}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                    loading || !tripType.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-sage hover:opacity-90'
                  }`}
                >
                  <SparklesIcon className="w-4 h-4" />
                  {loading ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Pack List Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pack List Name *
                </label>
                <input
                  type="text"
                  value={packListName}
                  onChange={(e) => setPackListName(e.target.value)}
                  placeholder="e.g., Florida with grandparents"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {generatedCategories.length} categories generated. Review, edit, and customize before creating.
              </p>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {generatedCategories.map((category, catIndex) => (
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
                          {item.quantity && (
                            <input
                              type="text"
                              value={item.quantity}
                              onChange={(e) => handleEditItem(catIndex, itemIndex, 'quantity', e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-sage focus:border-transparent text-center"
                              placeholder="Qty"
                            />
                          )}
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
                  onClick={handleCreate}
                  disabled={loading || !packListName.trim() || generatedCategories.length === 0}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                    loading || !packListName.trim() || generatedCategories.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-sage hover:opacity-90'
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Pack List'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
