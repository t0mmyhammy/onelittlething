'use client';

import { Eye, EyeOff, Plus, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface HealthSectionProps {
  data: any;
  notes: string;
  redactedFields: string[];
  onUpdate: (field: string, value: any) => void;
  onNotesUpdate: (notes: string) => void;
  onRedactionToggle: (field: string) => void;
}

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree nuts',
  'Dairy',
  'Eggs',
  'Wheat/Gluten',
  'Soy',
  'Fish',
  'Shellfish',
  'Bee stings',
  'Pet dander'
];

export default function HealthSection({
  data,
  notes,
  redactedFields,
  onUpdate,
  onNotesUpdate,
  onRedactionToggle
}: HealthSectionProps) {
  const [showMedications, setShowMedications] = useState(false);
  const [customAllergy, setCustomAllergy] = useState('');

  const isRedacted = (field: string) => redactedFields.includes(field);

  // Manage allergy list
  const allergies = data?.allergies || [];

  const addAllergy = (allergy: string) => {
    if (!allergies.includes(allergy)) {
      onUpdate('allergies', [...allergies, allergy]);
    }
  };

  const removeAllergy = (allergy: string) => {
    onUpdate('allergies', allergies.filter((a: string) => a !== allergy));
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim()) {
      addAllergy(customAllergy.trim());
      setCustomAllergy('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-red-900 mb-1">Critical medical info</p>
          <p className="text-red-700">This section auto-requires passcode when shared.</p>
        </div>
      </div>

      {/* Allergies */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Allergies
          </label>
          <button
            onClick={() => onRedactionToggle('allergies')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={isRedacted('allergies') ? 'Show in guides' : 'Hide in guides'}
          >
            {isRedacted('allergies') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Common allergies chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_ALLERGIES.map(allergy => {
            const isSelected = allergies.includes(allergy);
            return (
              <button
                key={allergy}
                onClick={() => isSelected ? removeAllergy(allergy) : addAllergy(allergy)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {allergy}
                {isSelected && <X className="w-3 h-3 inline ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Custom allergy input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomAllergy()}
            placeholder="Add another allergy..."
            className="flex-1 px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
          />
          <button
            onClick={addCustomAllergy}
            className="px-4 py-2 bg-sage text-white rounded-lg hover:bg-sage/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Selected allergies display */}
        {allergies.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg">
            <p className="text-xs font-semibold text-red-900 uppercase tracking-wide mb-2">
              Known allergies:
            </p>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy: string) => (
                <span
                  key={allergy}
                  className="px-3 py-1 bg-white border border-red-200 text-red-800 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {allergy}
                  <button
                    onClick={() => removeAllergy(allergy)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Allergy reaction */}
      {allergies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              What to do if exposed
            </label>
            <button
              onClick={() => onRedactionToggle('allergy_reaction')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isRedacted('allergy_reaction') ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <textarea
            value={data?.allergy_reaction || ''}
            onChange={(e) => onUpdate('allergy_reaction', e.target.value)}
            placeholder="Example: Epi-pen in backpack. Give immediately if breathing trouble, call 911. Benadryl for mild reactions."
            className="w-full px-4 py-3 border border-red-200 bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none text-sm"
            rows={3}
          />
        </div>
      )}

      {/* Medications */}
      <div>
        <button
          onClick={() => setShowMedications(!showMedications)}
          className="text-sm text-sage hover:text-rose font-medium transition-colors mb-3"
        >
          {showMedications ? 'Hide' : 'Add'} medications
        </button>

        {showMedications && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Daily medications
                </label>
                <button
                  onClick={() => onRedactionToggle('medications')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isRedacted('medications') ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <textarea
                value={data?.medications || ''}
                onChange={(e) => onUpdate('medications', e.target.value)}
                placeholder="Example: Flovent inhaler 2 puffs morning & night. Keep refrigerated."
                className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  As-needed medications
                </label>
                <button
                  onClick={() => onRedactionToggle('as_needed_meds')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isRedacted('as_needed_meds') ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <textarea
                value={data?.as_needed_meds || ''}
                onChange={(e) => onUpdate('as_needed_meds', e.target.value)}
                placeholder="Example: Tylenol for fever over 100.4°F. 5ml every 4-6 hours. Max 4 doses per day."
                className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Medical conditions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Medical conditions or special needs
          </label>
          <button
            onClick={() => onRedactionToggle('conditions')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('conditions') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.conditions || ''}
          onChange={(e) => onUpdate('conditions', e.target.value)}
          placeholder="Example: Type 1 diabetes. Check blood sugar before meals. Asthma - nebulizer in hall closet."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What caregivers should know
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="Important health context that helps caregivers understand..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
