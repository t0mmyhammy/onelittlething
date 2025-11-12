'use client';

import { Eye, EyeOff, Check, X } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import { getFieldGuideline, calculateAgeInMonths, getParentingTips } from '@/lib/cdcGuidelines';

interface SafetySectionProps {
  data: any;
  notes: string;
  redactedFields: string[];
  childBirthdate: string | null;
  onUpdate: (field: string, value: any) => void;
  onNotesUpdate: (notes: string) => void;
  onRedactionToggle: (field: string) => void;
}

export default function SafetySection({
  data,
  notes,
  redactedFields,
  childBirthdate,
  onUpdate,
  onNotesUpdate,
  onRedactionToggle
}: SafetySectionProps) {
  const isRedacted = (field: string) => redactedFields.includes(field);
  const ageInMonths = calculateAgeInMonths(childBirthdate);

  return (
    <div className="space-y-6">
      {/* Dos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Things they CAN do
            </label>
            <InfoTooltip
              title="Setting Boundaries"
              cdcGuidelines={getFieldGuideline('dos', ageInMonths) || undefined}
              parentingTips={getParentingTips('dos') || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('dos')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('dos') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.dos || ''}
          onChange={(e) => onUpdate('dos', e.target.value)}
          placeholder="Example: Can play in fenced backyard. Can use iPad for 30 min. Can have one treat after dinner."
          className="w-full px-4 py-3 border border-green-200 bg-green-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Don'ts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-3 h-3 text-red-600" />
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Things they CANNOT do
            </label>
            <InfoTooltip
              title="Setting Limits"
              cdcGuidelines={getFieldGuideline('donts', ageInMonths) || undefined}
              parentingTips={getParentingTips('donts') || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('donts')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('donts') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.donts || ''}
          onChange={(e) => onUpdate('donts', e.target.value)}
          placeholder="Example: No unsupervised water play. No candy with red dye. No YouTube without parent approval."
          className="w-full px-4 py-3 border border-red-200 bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Important warnings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Safety warnings or concerns
            </label>
            <InfoTooltip
              title="Safety Awareness"
              cdcGuidelines={getFieldGuideline('warnings', ageInMonths) || undefined}
              parentingTips={getParentingTips('warnings') || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('warnings')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('warnings') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.warnings || ''}
          onChange={(e) => onUpdate('warnings', e.target.value)}
          placeholder="Example: Climbs everything - watch near counters. Will wander if door left open. Afraid of dogs."
          className="w-full px-4 py-3 border border-amber-200 bg-amber-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Car seat / transportation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Car seat & transportation
            </label>
            <InfoTooltip
              title="Car Seat Safety"
              cdcGuidelines={getFieldGuideline('car_seat', ageInMonths) || undefined}
              parentingTips={getParentingTips('car_seat') || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('car_seat')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('car_seat') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <input
          type="text"
          value={data?.car_seat || ''}
          onChange={(e) => onUpdate('car_seat', e.target.value)}
          placeholder="Example: Rear-facing Graco in Mom's car. Booster seat in hall closet for other cars."
          className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other safety notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="Important safety context..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
