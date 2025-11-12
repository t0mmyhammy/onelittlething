'use client';

import { Eye, EyeOff, Home, Wifi, Key, Car } from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';

interface HomeBaseSectionProps {
  data: any;
  notes: string;
  redactedFields: string[];
  onUpdate: (field: string, value: any) => void;
  onNotesUpdate: (notes: string) => void;
  onRedactionToggle: (field: string) => void;
}

export default function HomeBaseSection({
  data,
  notes,
  redactedFields,
  onUpdate,
  onNotesUpdate,
  onRedactionToggle
}: HomeBaseSectionProps) {
  const isRedacted = (field: string) => redactedFields.includes(field);

  return (
    <div className="space-y-6">
      {/* Address */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Home Address</h4>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full address</label>
            <AddressAutocomplete
              value={data?.formatted_address || ''}
              onChange={(value) => onUpdate('formatted_address', value)}
              onAddressSelect={(address) => {
                // Update all address fields at once
                onUpdate('street_address', address.street_address);
                onUpdate('city', address.city);
                onUpdate('state', address.state);
                onUpdate('zip_code', address.zip_code);
              }}
              placeholder="Start typing your address..."
              className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Start typing and select from the suggestions
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input
                type="text"
                value={data?.city || ''}
                onChange={(e) => onUpdate('city', e.target.value)}
                placeholder="San Francisco"
                className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <input
                type="text"
                value={data?.state || ''}
                onChange={(e) => onUpdate('state', e.target.value)}
                placeholder="CA"
                className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ZIP code</label>
              <input
                type="text"
                value={data?.zip_code || ''}
                onChange={(e) => onUpdate('zip_code', e.target.value)}
                placeholder="94102"
                className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wi-Fi */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Wi-Fi network & password
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('wifi')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('wifi') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            value={data?.wifi_network || ''}
            onChange={(e) => onUpdate('wifi_network', e.target.value)}
            placeholder="Network name"
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm"
          />
          <input
            type="text"
            value={data?.wifi_password || ''}
            onChange={(e) => onUpdate('wifi_password', e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm font-mono"
          />
        </div>
      </div>

      {/* Door codes / keys */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Door codes, keys, & alarm
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('access')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('access') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.access || ''}
          onChange={(e) => onUpdate('access', e.target.value)}
          placeholder="Example: Front door code: 1234. Spare key under mat. Alarm code: 5678 (disarm within 30 seconds)."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm font-mono"
          rows={3}
        />
      </div>

      {/* Parking */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Parking instructions
            </label>
          </div>
          <button
            onClick={() => onRedactionToggle('parking')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isRedacted('parking') ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <textarea
          value={data?.parking || ''}
          onChange={(e) => onUpdate('parking', e.target.value)}
          placeholder="Example: Park in driveway or on street. Permit not required. Garage door opener in kitchen."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={2}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other home details
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="Anything else about getting into or around your home..."
          className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
