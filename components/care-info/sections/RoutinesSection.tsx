'use client';

import { Eye, EyeOff, Plus, X, Save } from 'lucide-react';
import { useState } from 'react';
import InfoTooltip from '../InfoTooltip';
import { getFieldGuideline, calculateAgeInMonths } from '@/lib/cdcGuidelines';

interface RoutinesSectionProps {
  data: any;
  notes: string;
  redactedFields: string[];
  childBirthdate: string | null;
  onUpdate: (field: string, value: any) => void;
  onNotesUpdate: (notes: string) => void;
  onRedactionToggle: (field: string) => void;
  onManualSave?: () => void;
}

const COMMON_WAKE_TIMES = ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM'];
const COMMON_BEDTIMES = ['7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];

export default function RoutinesSection({
  data,
  notes,
  redactedFields,
  childBirthdate,
  onUpdate,
  onNotesUpdate,
  onRedactionToggle,
  onManualSave
}: RoutinesSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isRedacted = (field: string) => redactedFields.includes(field);
  const ageInMonths = calculateAgeInMonths(childBirthdate);

  return (
    <div className="space-y-6">
      {/* Manual Save Button */}
      {onManualSave && (
        <div className="flex justify-end">
          <button
            onClick={onManualSave}
            className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-lg hover:bg-sage/90 transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save Now
          </button>
        </div>
      )}
      {/* Wake Time */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Wake time
            </label>
            <InfoTooltip
              title="Sleep Guidelines"
              cdcGuidelines={getFieldGuideline('wake_time', ageInMonths) || undefined}
              ageInMonths={ageInMonths}
            />
          </div>
          <button
            onClick={() => onRedactionToggle('wake_time')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={isRedacted('wake_time') ? 'Show in guides' : 'Hide in guides'}
          >
            {isRedacted('wake_time') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_WAKE_TIMES.map(time => (
            <button
              key={time}
              onClick={() => onUpdate('wake_time', time)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                data?.wake_time === time
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={data?.wake_time || ''}
          onChange={(e) => onUpdate('wake_time', e.target.value)}
          placeholder="Or enter a custom time..."
          className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
        />
      </div>

      {/* Naps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Nap schedule
          </label>
          <button
            onClick={() => onRedactionToggle('naps')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('naps') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.naps || ''}
          onChange={(e) => onUpdate('naps', e.target.value)}
          placeholder="Example: Usually naps from 1-3 PM. Needs dark room and white noise."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={2}
        />
      </div>

      {/* Meals */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Meal times & preferences
          </label>
          <button
            onClick={() => onRedactionToggle('meals')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('meals') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.meals || ''}
          onChange={(e) => onUpdate('meals', e.target.value)}
          placeholder="Example: Breakfast 7:30 AM, lunch 12:00 PM, dinner 5:30 PM. No nuts. Loves mac & cheese, hates peas."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Bedtime */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Bedtime
          </label>
          <button
            onClick={() => onRedactionToggle('bedtime')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('bedtime') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_BEDTIMES.map(time => (
            <button
              key={time}
              onClick={() => onUpdate('bedtime', time)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                data?.bedtime === time
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={data?.bedtime || ''}
          onChange={(e) => onUpdate('bedtime', e.target.value)}
          placeholder="Or enter a custom time..."
          className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm mb-3"
        />
        <textarea
          value={data?.bedtime_routine || ''}
          onChange={(e) => onUpdate('bedtime_routine', e.target.value)}
          placeholder="Bedtime routine steps: bath, pajamas, brush teeth, story, lights out..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Advanced Options */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-sage hover:text-rose font-medium transition-colors"
      >
        {showAdvanced ? 'Hide' : 'Show'} screen time & other routines
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-2">
          {/* Screen Time */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Screen time rules
              </label>
              <button
                onClick={() => onRedactionToggle('screen_time')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isRedacted('screen_time') ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <textarea
              value={data?.screen_time || ''}
              onChange={(e) => onUpdate('screen_time', e.target.value)}
              placeholder="Example: 30 minutes after homework. Only PBS Kids or approved YouTube."
              className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
              rows={2}
            />
          </div>

          {/* Potty/Diaper */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Potty or diaper changes
              </label>
              <button
                onClick={() => onRedactionToggle('potty')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isRedacted('potty') ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <textarea
              value={data?.potty || ''}
              onChange={(e) => onUpdate('potty', e.target.value)}
              placeholder="Example: In pull-ups. Remind to try potty every 2 hours. Wipes and cream under changing table."
              className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What actually works
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="The real-life tips that make routines easier..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
