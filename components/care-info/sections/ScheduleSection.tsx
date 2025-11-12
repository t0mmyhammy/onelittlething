'use client';

import { Eye, EyeOff, School, Activity, Clock } from 'lucide-react';

interface ScheduleSectionProps {
  data: any;
  notes: string;
  redactedFields: string[];
  onUpdate: (field: string, value: any) => void;
  onNotesUpdate: (notes: string) => void;
  onRedactionToggle: (field: string) => void;
}

export default function ScheduleSection({
  data,
  notes,
  redactedFields,
  onUpdate,
  onNotesUpdate,
  onRedactionToggle
}: ScheduleSectionProps) {
  const isRedacted = (field: string) => redactedFields.includes(field);

  return (
    <div className="space-y-6">
      {/* School/Daycare schedule */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <School className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-gray-900">School / Daycare</h4>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">School name</label>
            <input
              type="text"
              value={data?.school_name || ''}
              onChange={(e) => onUpdate('school_name', e.target.value)}
              placeholder="Lincoln Elementary"
              className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Drop-off time</label>
              <input
                type="text"
                value={data?.school_dropoff || ''}
                onChange={(e) => onUpdate('school_dropoff', e.target.value)}
                placeholder="8:00 AM"
                className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pickup time</label>
              <input
                type="text"
                value={data?.school_pickup || ''}
                onChange={(e) => onUpdate('school_pickup', e.target.value)}
                placeholder="3:00 PM"
                className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">School address</label>
            <input
              type="text"
              value={data?.school_address || ''}
              onChange={(e) => onUpdate('school_address', e.target.value)}
              placeholder="123 School Street, San Francisco, CA 94102"
              className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Weekly activities */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Weekly activities & classes
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('activities')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('activities') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.activities || ''}
          onChange={(e) => onUpdate('activities', e.target.value)}
          placeholder={'Example:\nMonday: Soccer practice 4-5 PM at park\nWednesday: Piano lessons 3:30 PM (123 Main St)\nSaturday: Swimming class 10 AM (community center)'}
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm font-mono"
          rows={5}
        />
      </div>

      {/* Pickup & transportation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Pickup & transportation details
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('transportation')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('transportation') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.transportation || ''}
          onChange={(e) => onUpdate('transportation', e.target.value)}
          placeholder="Example: Parker takes school bus home (arrives 3:15). Emma needs pickup from daycare by 5:30 or they charge $1/min. Car seats in garage."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Homework & assignments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Homework & assignment rules
          </label>
          <button
            onClick={() => onRedactionToggle('homework')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('homework') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.homework || ''}
          onChange={(e) => onUpdate('homework', e.target.value)}
          placeholder="Example: Homework before screens. Reading folder checked daily. Spelling test every Friday."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={2}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other schedule details
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="Anything else about the weekly schedule or routines..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
