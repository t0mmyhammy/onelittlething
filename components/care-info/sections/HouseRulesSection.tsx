'use client';

import { Eye, EyeOff, Monitor, Cookie, Dog, Users } from 'lucide-react';

interface HouseRulesSectionProps {
  data: any;
  notes: string;
  redactedFields: string[];
  onUpdate: (field: string, value: any) => void;
  onNotesUpdate: (notes: string) => void;
  onRedactionToggle: (field: string) => void;
}

export default function HouseRulesSection({
  data,
  notes,
  redactedFields,
  onUpdate,
  onNotesUpdate,
  onRedactionToggle
}: HouseRulesSectionProps) {
  const isRedacted = (field: string) => redactedFields.includes(field);

  return (
    <div className="space-y-6">
      {/* Screen time */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Screen time & TV rules
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('screen_rules')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('screen_rules') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.screen_rules || ''}
          onChange={(e) => onUpdate('screen_rules', e.target.value)}
          placeholder="Example: Max 1 hour per day. Only PBS Kids or parent-approved shows. No screens during meals or bedtime routine."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Snack & food rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cookie className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Snack & food rules
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('food_rules')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('food_rules') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.food_rules || ''}
          onChange={(e) => onUpdate('food_rules', e.target.value)}
          placeholder="Example: Snacks in pantry drawer. Ask before eating. No candy except after dinner. Must try 2 bites of everything."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Pet rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Dog className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Pet rules & care
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('pet_rules')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('pet_rules') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.pet_rules || ''}
          onChange={(e) => onUpdate('pet_rules', e.target.value)}
          placeholder="Example: Our dog Max is friendly but jumpy. Food in kitchen cupboard - 1 cup at 6 PM. Can pet him gently. Keep bedroom doors closed."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Visitor rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Visitor & friend rules
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('visitor_rules')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('visitor_rules') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.visitor_rules || ''}
          onChange={(e) => onUpdate('visitor_rules', e.target.value)}
          placeholder="Example: Please ask before having friends over. Playdates only with parent approval. Kids stay in playroom or backyard."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Off-limits areas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Off-limits areas or items
          </label>
          <button
            onClick={() => onRedactionToggle('off_limits')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('off_limits') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.off_limits || ''}
          onChange={(e) => onUpdate('off_limits', e.target.value)}
          placeholder="Example: Master bedroom, garage, liquor cabinet. Pool area only with adult supervision."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={2}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other house rules
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="Any other important rules or expectations..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
