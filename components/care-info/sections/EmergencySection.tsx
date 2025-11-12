'use client';

import { Eye, EyeOff, AlertTriangle, Hospital, FileText, MapPin } from 'lucide-react';

interface EmergencySectionProps {
  data: any;
  notes: string;
  redactedFields: string[];
  onUpdate: (field: string, value: any) => void;
  onNotesUpdate: (notes: string) => void;
  onRedactionToggle: (field: string) => void;
}

export default function EmergencySection({
  data,
  notes,
  redactedFields,
  onUpdate,
  onNotesUpdate,
  onRedactionToggle
}: EmergencySectionProps) {
  const isRedacted = (field: string) => redactedFields.includes(field);

  return (
    <div className="space-y-6">
      {/* Emergency alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-red-900 mb-1">Critical emergency info</p>
          <p className="text-red-700">This section auto-requires passcode when shared.</p>
        </div>
      </div>

      {/* Emergency plan */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Emergency action plan
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('emergency_plan')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('emergency_plan') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.emergency_plan || ''}
          onChange={(e) => onUpdate('emergency_plan', e.target.value)}
          placeholder="Example: Call 911 first. Then call Mom. Fire extinguisher under sink. Exit plan: front door or kitchen door to backyard."
          className="w-full px-4 py-3 border border-red-200 bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none text-sm"
          rows={4}
        />
      </div>

      {/* Nearest hospital */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Hospital className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-gray-900">Nearest Hospital / ER</h4>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hospital name</label>
            <input
              type="text"
              value={data?.hospital_name || ''}
              onChange={(e) => onUpdate('hospital_name', e.target.value)}
              placeholder="UCSF Medical Center"
              className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
            <input
              type="text"
              value={data?.hospital_address || ''}
              onChange={(e) => onUpdate('hospital_address', e.target.value)}
              placeholder="505 Parnassus Ave, San Francisco, CA 94143"
              className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Distance / drive time</label>
            <input
              type="text"
              value={data?.hospital_distance || ''}
              onChange={(e) => onUpdate('hospital_distance', e.target.value)}
              placeholder="2.5 miles / 8 minutes"
              className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Urgent care */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Nearest urgent care
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('urgent_care')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('urgent_care') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.urgent_care || ''}
          onChange={(e) => onUpdate('urgent_care', e.target.value)}
          placeholder="Example: CityMD Urgent Care, 123 Market St (1 mile, 5 min drive). Open 8 AM - 8 PM daily."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={2}
        />
      </div>

      {/* Insurance info */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Insurance information
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('insurance')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('insurance') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            value={data?.insurance_provider || ''}
            onChange={(e) => onUpdate('insurance_provider', e.target.value)}
            placeholder="Insurance provider (e.g., Blue Cross)"
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
          />
          <input
            type="text"
            value={data?.insurance_policy || ''}
            onChange={(e) => onUpdate('insurance_policy', e.target.value)}
            placeholder="Policy number"
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm font-mono"
          />
          <input
            type="text"
            value={data?.insurance_group || ''}
            onChange={(e) => onUpdate('insurance_group', e.target.value)}
            placeholder="Group number (if applicable)"
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm font-mono"
          />
        </div>
      </div>

      {/* Poison control */}
      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Poison Control:</span> 1-800-222-1222 (available 24/7)
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other emergency information
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="Any other critical emergency details..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
