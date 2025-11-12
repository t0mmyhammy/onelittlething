'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Home, Scale, Calendar, AlertCircle, Wifi, Key, Car } from 'lucide-react';
import SectionCard from './SectionCard';
import SectionGroup from './SectionGroup';
import CompactField from './CompactField';

interface FamilyCareInfo {
  id: string;
  family_id: string;
  home_base: any;
  home_base_notes: string | null;
  home_base_updated_at: string | null;
  home_base_redacted_fields: string[];
  house_rules: any;
  house_rules_notes: string | null;
  house_rules_updated_at: string | null;
  house_rules_redacted_fields: string[];
  schedule: any;
  schedule_notes: string | null;
  schedule_updated_at: string | null;
  schedule_redacted_fields: string[];
  emergency: any;
  emergency_notes: string | null;
  emergency_updated_at: string | null;
  emergency_redacted_fields: string[];
}

interface FamilyCareInfoTabV2Props {
  familyId: string;
  familyCareInfo: FamilyCareInfo | null;
  onUpdate: (updated: FamilyCareInfo) => void;
}

type SectionType = 'home_base' | 'house_rules' | 'schedule' | 'emergency';

export default function FamilyCareInfoTabV2({
  familyId,
  familyCareInfo: initialFamilyCareInfo,
  onUpdate
}: FamilyCareInfoTabV2Props) {
  const supabase = createClient();
  const [familyCareInfo, setFamilyCareInfo] = useState(initialFamilyCareInfo);
  const [expandedSection, setExpandedSection] = useState<SectionType | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Autosave function
  const saveChanges = useCallback(async (section: SectionType, data: any, notes?: string) => {
    if (!familyCareInfo) return;

    try {
      const updateData: any = {
        [section]: data,
        [`${section}_updated_at`]: new Date().toISOString(),
      };

      if (notes !== undefined) {
        updateData[`${section}_notes`] = notes;
      }

      const { data: updated, error } = await supabase
        .from('family_care_info')
        .update(updateData)
        .eq('id', familyCareInfo.id)
        .select()
        .single();

      if (error) throw error;
      if (updated) {
        setFamilyCareInfo(updated);
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error saving family care info:', error);
    }
  }, [familyCareInfo, supabase, onUpdate]);

  // Debounced update for field changes
  const updateField = useCallback((section: SectionType, field: string, value: string) => {
    setFamilyCareInfo(prev => {
      if (!prev) return prev;

      const updatedData = {
        ...prev,
        [section]: {
          ...(prev[section] || {}),
          [field]: value
        }
      };

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout to save after 1 second of inactivity
      saveTimeoutRef.current = setTimeout(() => {
        saveChanges(section, updatedData[section]);
      }, 1000);

      return updatedData;
    });
  }, [saveChanges]);

  // Update notes field
  const updateNotes = useCallback((section: SectionType, notes: string) => {
    setFamilyCareInfo(prev => {
      if (!prev) return prev;

      const updatedData = {
        ...prev,
        [`${section}_notes`]: notes
      };

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout to save after 1 second of inactivity
      saveTimeoutRef.current = setTimeout(() => {
        saveChanges(section, prev[section], notes);
      }, 1000);

      return updatedData;
    });
  }, [saveChanges]);

  // Generate summary text for collapsed view
  const getSummary = (section: SectionType): string => {
    if (!familyCareInfo) return '';

    const data = familyCareInfo[section] || {};

    switch (section) {
      case 'home_base':
        const parts = [];
        if (data.street_address) parts.push(data.street_address);
        if (data.wifi_network) parts.push(`Wi-Fi: ${data.wifi_network}`);
        if (data.parking) parts.push(`Parking: ${data.parking}`);
        return parts.join(' · ');

      case 'house_rules':
        const rules = [];
        if (data.screen_rules) rules.push('Screen time rules');
        if (data.food_rules) rules.push('Food rules');
        if (data.pet_rules) rules.push('Pet rules');
        return rules.join(', ') || '';

      case 'schedule':
        const schedule = [];
        if (data.school_name) schedule.push(data.school_name);
        if (data.activities) schedule.push('Activities scheduled');
        return schedule.join(' · ');

      case 'emergency':
        const emergency = [];
        if (data.emergency_plan) emergency.push('Emergency plan set');
        if (data.hospital_name) emergency.push(`Hospital: ${data.hospital_name}`);
        return emergency.join(' · ');

      default:
        return '';
    }
  };

  const handleToggle = (section: SectionType) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-8 pb-8">
      {/* Family Basics Group */}
      <SectionGroup
        title="Family Basics"
        subtitle="Home, rules, and daily schedule"
      >
        {/* Home Base */}
        <SectionCard
          title="Home Base"
          icon={Home}
          summary={getSummary('home_base')}
          updatedAt={familyCareInfo?.home_base_updated_at || undefined}
          isExpanded={expandedSection === 'home_base'}
          onToggle={() => handleToggle('home_base')}
        >
          <div className="space-y-4">
            {/* Address Group */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home Address
              </h4>
              <CompactField
                label="Street address"
                value={familyCareInfo?.home_base?.street_address || ''}
                placeholder="123 Main Street"
                onChange={(value) => updateField('home_base', 'street_address', value)}
              />
              <div className="grid grid-cols-3 gap-3">
                <CompactField
                  label="City"
                  value={familyCareInfo?.home_base?.city || ''}
                  placeholder="San Francisco"
                  onChange={(value) => updateField('home_base', 'city', value)}
                />
                <CompactField
                  label="State"
                  value={familyCareInfo?.home_base?.state || ''}
                  placeholder="CA"
                  onChange={(value) => updateField('home_base', 'state', value)}
                />
                <CompactField
                  label="ZIP"
                  value={familyCareInfo?.home_base?.zip_code || ''}
                  placeholder="94102"
                  onChange={(value) => updateField('home_base', 'zip_code', value)}
                />
              </div>
            </div>

            {/* Wi-Fi Group */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Wi-Fi & Internet
              </h4>
              <CompactField
                label="Network name"
                value={familyCareInfo?.home_base?.wifi_network || ''}
                placeholder="MyNetwork"
                icon={Wifi}
                onChange={(value) => updateField('home_base', 'wifi_network', value)}
              />
              <CompactField
                label="Password"
                value={familyCareInfo?.home_base?.wifi_password || ''}
                placeholder="••••••••"
                isSecure
                onChange={(value) => updateField('home_base', 'wifi_password', value)}
              />
            </div>

            {/* Access Group */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Door Codes & Keys
              </h4>
              <CompactField
                label="Access instructions"
                value={familyCareInfo?.home_base?.access || ''}
                placeholder="Front door code: 1234. Spare key under mat."
                multiline
                rows={3}
                isSecure
                onChange={(value) => updateField('home_base', 'access', value)}
              />
            </div>

            {/* Parking */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Parking & Visitor Info
              </h4>
              <CompactField
                label="Parking instructions"
                value={familyCareInfo?.home_base?.parking || ''}
                placeholder="Park in driveway or on street"
                multiline
                rows={2}
                onChange={(value) => updateField('home_base', 'parking', value)}
              />
            </div>

            {/* Notes */}
            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Other home details"
                value={familyCareInfo?.home_base_notes || ''}
                placeholder="Anything else about your home..."
                multiline
                rows={3}
                onChange={(value) => updateNotes('home_base', value)}
              />
            </div>
          </div>
        </SectionCard>

        {/* House Rules */}
        <SectionCard
          title="House Rules"
          icon={Scale}
          summary={getSummary('house_rules')}
          updatedAt={familyCareInfo?.house_rules_updated_at || undefined}
          isExpanded={expandedSection === 'house_rules'}
          onToggle={() => handleToggle('house_rules')}
        >
          <div className="space-y-4">
            <CompactField
              label="Screen time rules"
              value={familyCareInfo?.house_rules?.screen_rules || ''}
              placeholder="30 min after homework, no screens during meals"
              multiline
              rows={2}
              onChange={(value) => updateField('house_rules', 'screen_rules', value)}
            />
            <CompactField
              label="Food & snacks"
              value={familyCareInfo?.house_rules?.food_rules || ''}
              placeholder="Snacks in pantry. Ask before opening fridge."
              multiline
              rows={2}
              onChange={(value) => updateField('house_rules', 'food_rules', value)}
            />
            <CompactField
              label="Pet rules"
              value={familyCareInfo?.house_rules?.pet_rules || ''}
              placeholder="Dog stays outside. Don't feed table scraps."
              multiline
              rows={2}
              onChange={(value) => updateField('house_rules', 'pet_rules', value)}
            />
            <CompactField
              label="Visitor rules"
              value={familyCareInfo?.house_rules?.visitor_rules || ''}
              placeholder="No friends over unless parent approves"
              multiline
              rows={2}
              onChange={(value) => updateField('house_rules', 'visitor_rules', value)}
            />
            <CompactField
              label="Off-limits areas"
              value={familyCareInfo?.house_rules?.off_limits || ''}
              placeholder="Master bedroom, garage, basement"
              multiline
              rows={2}
              onChange={(value) => updateField('house_rules', 'off_limits', value)}
            />
          </div>
        </SectionCard>

        {/* Schedule */}
        <SectionCard
          title="Schedule"
          icon={Calendar}
          summary={getSummary('schedule')}
          updatedAt={familyCareInfo?.schedule_updated_at || undefined}
          isExpanded={expandedSection === 'schedule'}
          onToggle={() => handleToggle('schedule')}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">School/Daycare</h4>
              <CompactField
                label="School name"
                value={familyCareInfo?.schedule?.school_name || ''}
                placeholder="Lincoln Elementary"
                onChange={(value) => updateField('schedule', 'school_name', value)}
              />
              <CompactField
                label="Address"
                value={familyCareInfo?.schedule?.school_address || ''}
                placeholder="123 School St"
                multiline
                rows={2}
                onChange={(value) => updateField('schedule', 'school_address', value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <CompactField
                  label="Drop-off time"
                  value={familyCareInfo?.schedule?.school_dropoff || ''}
                  placeholder="8:00 AM"
                  onChange={(value) => updateField('schedule', 'school_dropoff', value)}
                />
                <CompactField
                  label="Pickup time"
                  value={familyCareInfo?.schedule?.school_pickup || ''}
                  placeholder="3:00 PM"
                  onChange={(value) => updateField('schedule', 'school_pickup', value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Weekly activities"
                value={familyCareInfo?.schedule?.activities || ''}
                placeholder="Mon: Soccer 4pm, Wed: Piano 5pm"
                multiline
                rows={3}
                onChange={(value) => updateField('schedule', 'activities', value)}
              />
            </div>

            <CompactField
              label="Transportation notes"
              value={familyCareInfo?.schedule?.transportation || ''}
              placeholder="Bus #12, carpool with neighbors"
              multiline
              rows={2}
              onChange={(value) => updateField('schedule', 'transportation', value)}
            />

            <CompactField
              label="Homework rules"
              value={familyCareInfo?.schedule?.homework || ''}
              placeholder="Complete before screen time"
              multiline
              rows={2}
              onChange={(value) => updateField('schedule', 'homework', value)}
            />
          </div>
        </SectionCard>
      </SectionGroup>

      {/* Safety & Emergencies Group */}
      <SectionGroup
        title="Safety & Emergencies"
        subtitle="Emergency contacts and protocols"
      >
        {/* Emergency */}
        <SectionCard
          title="Emergency Information"
          icon={AlertCircle}
          summary={getSummary('emergency')}
          updatedAt={familyCareInfo?.emergency_updated_at || undefined}
          isExpanded={expandedSection === 'emergency'}
          onToggle={() => handleToggle('emergency')}
        >
          <div className="space-y-4">
            {/* Help Tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Include what caregivers should know in an emergency — but skip sensitive details like SSN or account numbers.
              </p>
            </div>

            <CompactField
              label="Emergency action plan"
              value={familyCareInfo?.emergency?.emergency_plan || ''}
              placeholder="Call 911 first, then call parents. First aid kit in bathroom."
              multiline
              rows={3}
              onChange={(value) => updateField('emergency', 'emergency_plan', value)}
            />

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">Nearest Hospital</h4>
              <CompactField
                label="Hospital name"
                value={familyCareInfo?.emergency?.hospital_name || ''}
                placeholder="St. Mary's Hospital"
                onChange={(value) => updateField('emergency', 'hospital_name', value)}
              />
              <CompactField
                label="Address"
                value={familyCareInfo?.emergency?.hospital_address || ''}
                placeholder="456 Medical Dr"
                multiline
                rows={2}
                onChange={(value) => updateField('emergency', 'hospital_address', value)}
              />
              <CompactField
                label="Distance"
                value={familyCareInfo?.emergency?.hospital_distance || ''}
                placeholder="5 min drive"
                onChange={(value) => updateField('emergency', 'hospital_distance', value)}
              />
            </div>

            <CompactField
              label="Urgent care"
              value={familyCareInfo?.emergency?.urgent_care || ''}
              placeholder="ABC Urgent Care, 789 Care St"
              multiline
              rows={2}
              onChange={(value) => updateField('emergency', 'urgent_care', value)}
            />

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">Insurance</h4>
              <CompactField
                label="Provider"
                value={familyCareInfo?.emergency?.insurance_provider || ''}
                placeholder="Blue Cross Blue Shield"
                onChange={(value) => updateField('emergency', 'insurance_provider', value)}
              />
              <CompactField
                label="Policy number"
                value={familyCareInfo?.emergency?.insurance_policy || ''}
                placeholder="ABC123456"
                isSecure
                onChange={(value) => updateField('emergency', 'insurance_policy', value)}
              />
              <CompactField
                label="Group number"
                value={familyCareInfo?.emergency?.insurance_group || ''}
                placeholder="XYZ789"
                isSecure
                onChange={(value) => updateField('emergency', 'insurance_group', value)}
              />
            </div>

            <div className="pt-4 border-t border-gray-100 bg-gray-50 -mx-5 -mb-5 px-5 py-4 rounded-b-lg">
              <p className="text-sm text-gray-600">
                <strong>Poison Control:</strong> 1-800-222-1222 (24/7)
              </p>
            </div>
          </div>
        </SectionCard>
      </SectionGroup>
    </div>
  );
}
