'use client';

import { Eye, EyeOff, Phone, User, Stethoscope } from 'lucide-react';

interface ContactsSectionProps {
  data: any;
  notes: string;
  redactedFields: string[];
  onUpdate: (field: string, value: any) => void;
  onNotesUpdate: (notes: string) => void;
  onRedactionToggle: (field: string) => void;
}

export default function ContactsSection({
  data,
  notes,
  redactedFields,
  onUpdate,
  onNotesUpdate,
  onRedactionToggle
}: ContactsSectionProps) {
  const isRedacted = (field: string) => redactedFields.includes(field);

  return (
    <div className="space-y-6">
      {/* Parent/Guardian 1 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Parent/Guardian 1</h4>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={data?.parent1_name || ''}
              onChange={(e) => onUpdate('parent1_name', e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              value={data?.parent1_phone || ''}
              onChange={(e) => onUpdate('parent1_phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={data?.parent1_email || ''}
              onChange={(e) => onUpdate('parent1_email', e.target.value)}
              placeholder="parent@email.com"
              className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
            />
          </div>
        </div>
      </div>

      {/* Parent/Guardian 2 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Parent/Guardian 2</h4>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={data?.parent2_name || ''}
              onChange={(e) => onUpdate('parent2_name', e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              value={data?.parent2_phone || ''}
              onChange={(e) => onUpdate('parent2_phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={data?.parent2_email || ''}
              onChange={(e) => onUpdate('parent2_email', e.target.value)}
              placeholder="parent@email.com"
              className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
            />
          </div>
        </div>
      </div>

      {/* Pediatrician */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-gray-900">Pediatrician</h4>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Doctor name</label>
            <input
              type="text"
              value={data?.doctor_name || ''}
              onChange={(e) => onUpdate('doctor_name', e.target.value)}
              placeholder="Dr. Smith"
              className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Office phone</label>
            <input
              type="tel"
              value={data?.doctor_phone || ''}
              onChange={(e) => onUpdate('doctor_phone', e.target.value)}
              placeholder="(555) 987-6543"
              className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Clinic name</label>
            <input
              type="text"
              value={data?.doctor_clinic || ''}
              onChange={(e) => onUpdate('doctor_clinic', e.target.value)}
              placeholder="Pediatric Associates"
              className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Emergency contacts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Other emergency contacts
          </label>
          <button
            onClick={() => onRedactionToggle('emergency_contacts')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('emergency_contacts') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.emergency_contacts || ''}
          onChange={(e) => onUpdate('emergency_contacts', e.target.value)}
          placeholder="Example: Grandma Sue - (555) 222-3333&#10;Uncle Mike - (555) 444-5555&#10;Neighbor Sarah - (555) 666-7777"
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm font-mono"
          rows={4}
        />
      </div>

      {/* Authorized pickup */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Authorized pickup (for school/daycare)
          </label>
          <button
            onClick={() => onRedactionToggle('authorized_pickup')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('authorized_pickup') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.authorized_pickup || ''}
          onChange={(e) => onUpdate('authorized_pickup', e.target.value)}
          placeholder="List everyone allowed to pick up your child..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other contact info
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="Any other important contact information..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
