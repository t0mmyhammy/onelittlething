'use client';

import { useState } from 'react';
import { XMarkIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface PackListTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'baby' | 'travel' | 'general';
  requiresDueDate?: boolean;
}

interface PackListTemplatesModalProps {
  onClose: () => void;
  onGenerateTemplate: (templateId: string) => Promise<void>;
  hasDueDate: boolean;
}

const TEMPLATES: PackListTemplate[] = [
  {
    id: 'hospital-bags',
    name: 'Hospital Bags for New Baby',
    description: 'Complete hospital bag pack lists for mom, partner, and baby. Auto-generates 3-5 lists based on your family.',
    icon: '👶',
    category: 'baby',
    requiresDueDate: true,
  },
  {
    id: 'road-trip',
    name: 'Road Trip Essentials',
    description: 'Everything you need for a successful road trip - snacks, entertainment, safety items, and comfort essentials.',
    icon: '🚗',
    category: 'travel',
  },
  {
    id: 'beach-vacation',
    name: 'Beach Vacation',
    description: 'Beach essentials, sun protection, water activities, and relaxation items for the perfect beach getaway.',
    icon: '🏖️',
    category: 'travel',
  },
  {
    id: 'camping-trip',
    name: 'Camping Trip',
    description: 'Camping gear, outdoor essentials, food prep, and safety items for a great outdoor adventure.',
    icon: '⛺',
    category: 'travel',
  },
];

export default function PackListTemplatesModal({
  onClose,
  onGenerateTemplate,
  hasDueDate,
}: PackListTemplatesModalProps) {
  const [generatingTemplate, setGeneratingTemplate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'baby' | 'travel' | 'general'>('all');

  const handleGenerate = async (templateId: string) => {
    setGeneratingTemplate(templateId);
    try {
      await onGenerateTemplate(templateId);
      onClose();
    } catch (error) {
      console.error('Error generating template:', error);
      alert('Failed to generate pack lists. Please try again.');
    } finally {
      setGeneratingTemplate(null);
    }
  };

  const filteredTemplates = TEMPLATES.filter(template => {
    // Filter by category
    if (selectedCategory !== 'all' && template.category !== selectedCategory) {
      return false;
    }

    // Hide templates that require due date if none exists
    if (template.requiresDueDate && !hasDueDate) {
      return false;
    }

    return true;
  });

  const categories = [
    { id: 'all', label: 'All Templates', icon: '📋' },
    { id: 'baby', label: 'Baby', icon: '👶' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'general', label: 'General', icon: '📦' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛠️</span>
            <div>
              <h2 className="text-xl font-serif text-gray-900">
                Pack List Templates
              </h2>
              <p className="text-sm text-gray-500">Auto-generate organized pack lists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-sage text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No templates available in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => {
                const isGenerating = generatingTemplate === template.id;

                return (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-sage hover:bg-sage/5 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{template.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGenerate(template.id)}
                      disabled={isGenerating || generatingTemplate !== null}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sage text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RocketLaunchIcon className="w-4 h-4" />
                      {isGenerating ? 'Generating...' : 'Generate Pack Lists'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
