'use client';

import { Eye, EyeOff } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import { getFieldGuideline, calculateAgeInMonths, getParentingTips } from '@/lib/cdcGuidelines';

interface ComfortSectionProps {
  data: any;
  notes: string;
  redactedFields: string[];
  childBirthdate: string | null;
  onUpdate: (field: string, value: any) => void;
  onNotesUpdate: (notes: string) => void;
  onRedactionToggle: (field: string) => void;
}

export default function ComfortSection({
  data,
  notes,
  redactedFields,
  childBirthdate,
  onUpdate,
  onNotesUpdate,
  onRedactionToggle
}: ComfortSectionProps) {
  const isRedacted = (field: string) => redactedFields.includes(field);
  const ageInMonths = calculateAgeInMonths(childBirthdate);

  return (
    <div className="space-y-6">
      {/* Calming tips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              How to calm them down
            </label>
            <InfoTooltip
              title="Calming Strategies"
              cdcGuidelines={getFieldGuideline('calming_tips', ageInMonths) || undefined}
              parentingTips={getParentingTips('calming_tips') || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('calming_tips')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('calming_tips') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.calming_tips || ''}
          onChange={(e) => onUpdate('calming_tips', e.target.value)}
          placeholder="Example: Deep breaths. Hug their stuffed elephant. Sing 'You Are My Sunshine.' Dim lights help."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Comfort items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Special comfort items
            </label>
            <InfoTooltip
              title="Comfort Objects"
              cdcGuidelines={getFieldGuideline('comfort_items', ageInMonths) || undefined}
              parentingTips={getParentingTips('comfort_items') || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('comfort_items')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('comfort_items') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <input
          type="text"
          value={data?.comfort_items || ''}
          onChange={(e) => onUpdate('comfort_items', e.target.value)}
          placeholder="Example: Blue blankie with stars, stuffed elephant named Ellie"
          className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
        />
      </div>

      {/* Favorites */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Favorite things
            </label>
            <InfoTooltip
              title="Favorites & Interests"
              cdcGuidelines={getFieldGuideline('favorites', ageInMonths) || undefined}
              parentingTips={getParentingTips('favorites') || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('favorites')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('favorites') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.favorites || ''}
          onChange={(e) => onUpdate('favorites', e.target.value)}
          placeholder="Example: Loves dinosaurs, Daniel Tiger, playing outside, mac & cheese, being read to."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Dislikes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Dislikes or triggers
            </label>
            <InfoTooltip
              title="Dislikes & Triggers"
              cdcGuidelines={getFieldGuideline('dislikes', ageInMonths) || undefined}
              parentingTips={getParentingTips('dislikes') || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('dislikes')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('dislikes') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.dislikes || ''}
          onChange={(e) => onUpdate('dislikes', e.target.value)}
          placeholder="Example: Hates loud noises. Gets upset when naptime is skipped. Doesn't like being rushed."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Behavior notes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Behavioral notes
            </label>
            <InfoTooltip
              title="Behavior Guidance"
              cdcGuidelines={getFieldGuideline('behavior', ageInMonths) || undefined}
              parentingTips={getParentingTips('behavior') || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('behavior')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('behavior') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.behavior || ''}
          onChange={(e) => onUpdate('behavior', e.target.value)}
          placeholder="Example: Sometimes shy with new people. Warms up after 10 minutes. Timeout spot is bottom stair."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other comfort tips
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="The tricks that actually work when they're having a hard time..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
