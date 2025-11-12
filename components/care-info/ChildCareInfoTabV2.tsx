'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Clock, Heart, Shield, Phone, AlertCircle, Sun, Moon, Utensils, Baby } from 'lucide-react';
import SectionCard from './SectionCard';
import SectionGroup from './SectionGroup';
import CompactField from './CompactField';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  photo_url: string | null;
}

interface ChildCareInfo {
  id: string;
  child_id: string;
  routines: any;
  routines_notes: string | null;
  routines_updated_at: string | null;
  routines_redacted_fields: string[];
  health: any;
  health_notes: string | null;
  health_updated_at: string | null;
  health_redacted_fields: string[];
  comfort: any;
  comfort_notes: string | null;
  comfort_updated_at: string | null;
  comfort_redacted_fields: string[];
  safety: any;
  safety_notes: string | null;
  safety_updated_at: string | null;
  safety_redacted_fields: string[];
  contacts: any;
  contacts_notes: string | null;
  contacts_updated_at: string | null;
  contacts_redacted_fields: string[];
}

interface ChildCareInfoTabV2Props {
  child: Child;
  careInfo: ChildCareInfo | undefined;
  onUpdate: (info: ChildCareInfo) => void;
}

type SectionType = 'routines' | 'health' | 'comfort' | 'safety' | 'contacts';

export default function ChildCareInfoTabV2({
  child,
  careInfo: initialCareInfo,
  onUpdate
}: ChildCareInfoTabV2Props) {
  const supabase = createClient();
  const [careInfo, setCareInfo] = useState(initialCareInfo);
  const [expandedSection, setExpandedSection] = useState<SectionType | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Autosave function
  const saveChanges = useCallback(async (section: SectionType, data: any, notes?: string) => {
    if (!careInfo) return;

    try {
      const updateData: any = {
        [section]: data,
        [`${section}_updated_at`]: new Date().toISOString(),
      };

      if (notes !== undefined) {
        updateData[`${section}_notes`] = notes;
      }

      const { data: updated, error } = await supabase
        .from('child_care_info')
        .update(updateData)
        .eq('id', careInfo.id)
        .select()
        .single();

      if (error) throw error;
      if (updated) {
        setCareInfo(updated);
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error saving child care info:', error);
    }
  }, [careInfo, supabase, onUpdate]);

  // Debounced update for field changes
  const updateField = useCallback((section: SectionType, field: string, value: string) => {
    setCareInfo(prev => {
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
    setCareInfo(prev => {
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
    if (!careInfo) return '';

    const data = careInfo[section] || {};

    switch (section) {
      case 'routines':
        const routines = [];
        if (data.bedtime) routines.push(`Bedtime: ${data.bedtime}`);
        if (data.wake_time) routines.push(`Wake: ${data.wake_time}`);
        if (data.naps) routines.push('Nap schedule set');
        return routines.join(' · ');

      case 'health':
        const health = [];
        if (data.allergies && Array.isArray(data.allergies) && data.allergies.length > 0) {
          health.push(`⚠️ Allergies: ${data.allergies.join(', ')}`);
        }
        if (data.medications) health.push('Daily medications');
        if (data.conditions) health.push('Medical conditions noted');
        return health.join(' · ');

      case 'comfort':
        const comfort = [];
        if (data.calming_tips) comfort.push('Calming strategies');
        if (data.favorites) comfort.push('Favorites noted');
        if (data.comfort_items) comfort.push('Comfort items');
        return comfort.join(' · ');

      case 'safety':
        const safety = [];
        if (data.dos) safety.push('Safe activities');
        if (data.donts) safety.push('Safety warnings');
        if (data.car_seat) safety.push('Car seat info');
        return safety.join(' · ');

      case 'contacts':
        const contacts = [];
        if (data.parent1_name) contacts.push(data.parent1_name);
        if (data.parent2_name) contacts.push(data.parent2_name);
        if (data.doctor_name) contacts.push(`Dr. ${data.doctor_name}`);
        return contacts.join(' · ');

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
      {/* Daily Rhythms Group */}
      <SectionGroup
        title="Daily Rhythms"
        subtitle="Sleep, meals, and daily routines"
      >
        {/* Routines */}
        <SectionCard
          title="Routines"
          icon={Clock}
          summary={getSummary('routines')}
          updatedAt={careInfo?.routines_updated_at || undefined}
          isExpanded={expandedSection === 'routines'}
          onToggle={() => handleToggle('routines')}
        >
          <div className="space-y-4">
            {/* Sleep Schedule */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Sleep Schedule
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <CompactField
                  label="Wake time"
                  value={careInfo?.routines?.wake_time || ''}
                  placeholder="7:00 AM"
                  icon={Sun}
                  onChange={(value) => updateField('routines', 'wake_time', value)}
                />
                <CompactField
                  label="Bedtime"
                  value={careInfo?.routines?.bedtime || ''}
                  placeholder="8:00 PM"
                  icon={Moon}
                  onChange={(value) => updateField('routines', 'bedtime', value)}
                />
              </div>
              <CompactField
                label="Nap schedule"
                value={careInfo?.routines?.naps || ''}
                placeholder="1:00-3:00 PM"
                multiline
                rows={2}
                onChange={(value) => updateField('routines', 'naps', value)}
              />
              <CompactField
                label="Bedtime routine"
                value={careInfo?.routines?.bedtime_routine || ''}
                placeholder="Bath, books, lullaby, lights out"
                multiline
                rows={3}
                onChange={(value) => updateField('routines', 'bedtime_routine', value)}
              />
            </div>

            {/* Meals */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Meals & Eating
              </h4>
              <CompactField
                label="Meal times"
                value={careInfo?.routines?.meals || ''}
                placeholder="Breakfast 7:30, Lunch 12:00, Dinner 5:30"
                multiline
                rows={2}
                onChange={(value) => updateField('routines', 'meals', value)}
              />
            </div>

            {/* Other Routines */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">Other Routines</h4>
              <CompactField
                label="Screen time rules"
                value={careInfo?.routines?.screen_time || ''}
                placeholder="30 min after homework, educational only"
                multiline
                rows={2}
                onChange={(value) => updateField('routines', 'screen_time', value)}
              />
              <CompactField
                label="Potty/Diaper routine"
                value={careInfo?.routines?.potty || ''}
                placeholder="Pull-up at night, asks to use potty"
                multiline
                rows={2}
                onChange={(value) => updateField('routines', 'potty', value)}
              />
            </div>

            {/* Notes */}
            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Other routine notes"
                value={careInfo?.routines_notes || ''}
                placeholder="Any other daily routine details..."
                multiline
                rows={3}
                onChange={(value) => updateNotes('routines', value)}
              />
            </div>
          </div>
        </SectionCard>
      </SectionGroup>

      {/* Health & Well-being Group */}
      <SectionGroup
        title="Health & Well-being"
        subtitle="Medical info, allergies, and comfort"
      >
        {/* Health */}
        <SectionCard
          title="Health Information"
          icon={AlertCircle}
          summary={getSummary('health')}
          updatedAt={careInfo?.health_updated_at || undefined}
          isExpanded={expandedSection === 'health'}
          onToggle={() => handleToggle('health')}
        >
          <div className="space-y-4">
            {/* Critical Alert */}
            {careInfo?.health?.allergies && Array.isArray(careInfo.health.allergies) && careInfo.health.allergies.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 text-sm">ALLERGIES</p>
                    <p className="text-red-800 mt-1">{careInfo.health.allergies.join(', ')}</p>
                    {careInfo.health.allergy_reaction && (
                      <p className="text-sm text-red-700 mt-2">
                        <strong>If exposed:</strong> {careInfo.health.allergy_reaction}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Allergies Input */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Allergies & Reactions</h4>
              <CompactField
                label="Known allergies"
                value={careInfo?.health?.allergies?.join(', ') || ''}
                placeholder="Peanuts, shellfish, penicillin"
                onChange={(value) => updateField('health', 'allergies', value)}
              />
              <CompactField
                label="What to do if exposed"
                value={careInfo?.health?.allergy_reaction || ''}
                placeholder="Give EpiPen immediately, call 911"
                multiline
                rows={2}
                onChange={(value) => updateField('health', 'allergy_reaction', value)}
              />
            </div>

            {/* Medications */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">Medications</h4>
              <CompactField
                label="Daily medications"
                value={careInfo?.health?.medications || ''}
                placeholder="Vitamin D 400 IU with breakfast"
                multiline
                rows={3}
                onChange={(value) => updateField('health', 'medications', value)}
              />
              <CompactField
                label="As-needed medications"
                value={careInfo?.health?.as_needed_meds || ''}
                placeholder="Tylenol for fever, Benadryl for reactions"
                multiline
                rows={3}
                onChange={(value) => updateField('health', 'as_needed_meds', value)}
              />
            </div>

            {/* Conditions */}
            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Medical conditions"
                value={careInfo?.health?.conditions || ''}
                placeholder="Asthma (mild), eczema"
                multiline
                rows={3}
                onChange={(value) => updateField('health', 'conditions', value)}
              />
            </div>

            {/* Notes */}
            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Other health notes"
                value={careInfo?.health_notes || ''}
                placeholder="Any other medical details..."
                multiline
                rows={3}
                onChange={(value) => updateNotes('health', value)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Comfort */}
        <SectionCard
          title="Comfort & Behavior"
          icon={Heart}
          summary={getSummary('comfort')}
          updatedAt={careInfo?.comfort_updated_at || undefined}
          isExpanded={expandedSection === 'comfort'}
          onToggle={() => handleToggle('comfort')}
        >
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-900">
                <strong>💡 Tip:</strong> Share what helps your child feel safe, happy, and understood.
              </p>
            </div>

            <CompactField
              label="How to calm them"
              value={careInfo?.comfort?.calming_tips || ''}
              placeholder="Deep breaths, counting to 10, gentle back rubs"
              multiline
              rows={3}
              onChange={(value) => updateField('comfort', 'calming_tips', value)}
            />
            <CompactField
              label="Comfort items"
              value={careInfo?.comfort?.comfort_items || ''}
              placeholder="Blue blankie, teddy bear, pacifier"
              multiline
              rows={2}
              onChange={(value) => updateField('comfort', 'comfort_items', value)}
            />
            <CompactField
              label="Favorites"
              value={careInfo?.comfort?.favorites || ''}
              placeholder="Loves Daniel Tiger, playing with cars, reading books"
              multiline
              rows={3}
              onChange={(value) => updateField('comfort', 'favorites', value)}
            />
            <CompactField
              label="Dislikes & triggers"
              value={careInfo?.comfort?.dislikes || ''}
              placeholder="Loud noises, scratchy tags, green foods"
              multiline
              rows={3}
              onChange={(value) => updateField('comfort', 'dislikes', value)}
            />
            <CompactField
              label="Behavioral notes"
              value={careInfo?.comfort?.behavior || ''}
              placeholder="Gets shy around new people, needs warning before transitions"
              multiline
              rows={3}
              onChange={(value) => updateField('comfort', 'behavior', value)}
            />

            {/* Notes */}
            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Other comfort notes"
                value={careInfo?.comfort_notes || ''}
                placeholder="Any other comfort details..."
                multiline
                rows={3}
                onChange={(value) => updateNotes('comfort', value)}
              />
            </div>
          </div>
        </SectionCard>
      </SectionGroup>

      {/* Safety & Contacts Group */}
      <SectionGroup
        title="Safety & Contacts"
        subtitle="Rules, boundaries, and emergency contacts"
      >
        {/* Safety */}
        <SectionCard
          title="Safety Rules"
          icon={Shield}
          summary={getSummary('safety')}
          updatedAt={careInfo?.safety_updated_at || undefined}
          isExpanded={expandedSection === 'safety'}
          onToggle={() => handleToggle('safety')}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">✅ Safe Activities</h4>
              <CompactField
                label="Things they CAN do"
                value={careInfo?.safety?.dos || ''}
                placeholder="Play in backyard with supervision, ride bike with helmet"
                multiline
                rows={3}
                onChange={(value) => updateField('safety', 'dos', value)}
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">❌ Safety Rules</h4>
              <CompactField
                label="Things they CANNOT do"
                value={careInfo?.safety?.donts || ''}
                placeholder="No pool without adult, no climbing on furniture"
                multiline
                rows={3}
                onChange={(value) => updateField('safety', 'donts', value)}
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">⚠️ Important Warnings</h4>
              <CompactField
                label="Safety warnings"
                value={careInfo?.safety?.warnings || ''}
                placeholder="Runs toward street, puts small objects in mouth"
                multiline
                rows={3}
                onChange={(value) => updateField('safety', 'warnings', value)}
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Car seat info"
                value={careInfo?.safety?.car_seat || ''}
                placeholder="Forward-facing Graco, 30-65 lbs, in back seat"
                multiline
                rows={2}
                onChange={(value) => updateField('safety', 'car_seat', value)}
              />
            </div>

            {/* Notes */}
            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Other safety notes"
                value={careInfo?.safety_notes || ''}
                placeholder="Any other safety details..."
                multiline
                rows={3}
                onChange={(value) => updateNotes('safety', value)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Contacts */}
        <SectionCard
          title="Emergency Contacts"
          icon={Phone}
          summary={getSummary('contacts')}
          updatedAt={careInfo?.contacts_updated_at || undefined}
          isExpanded={expandedSection === 'contacts'}
          onToggle={() => handleToggle('contacts')}
        >
          <div className="space-y-4">
            {/* Parent 1 */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Parent / Guardian 1</h4>
              <CompactField
                label="Name"
                value={careInfo?.contacts?.parent1_name || ''}
                placeholder="Full name"
                onChange={(value) => updateField('contacts', 'parent1_name', value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <CompactField
                  label="Phone"
                  value={careInfo?.contacts?.parent1_phone || ''}
                  placeholder="(555) 123-4567"
                  onChange={(value) => updateField('contacts', 'parent1_phone', value)}
                />
                <CompactField
                  label="Email"
                  value={careInfo?.contacts?.parent1_email || ''}
                  placeholder="parent@email.com"
                  onChange={(value) => updateField('contacts', 'parent1_email', value)}
                />
              </div>
            </div>

            {/* Parent 2 */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">Parent / Guardian 2</h4>
              <CompactField
                label="Name"
                value={careInfo?.contacts?.parent2_name || ''}
                placeholder="Full name"
                onChange={(value) => updateField('contacts', 'parent2_name', value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <CompactField
                  label="Phone"
                  value={careInfo?.contacts?.parent2_phone || ''}
                  placeholder="(555) 123-4567"
                  onChange={(value) => updateField('contacts', 'parent2_phone', value)}
                />
                <CompactField
                  label="Email"
                  value={careInfo?.contacts?.parent2_email || ''}
                  placeholder="parent@email.com"
                  onChange={(value) => updateField('contacts', 'parent2_email', value)}
                />
              </div>
            </div>

            {/* Pediatrician */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">Pediatrician</h4>
              <CompactField
                label="Doctor name"
                value={careInfo?.contacts?.doctor_name || ''}
                placeholder="Dr. Smith"
                onChange={(value) => updateField('contacts', 'doctor_name', value)}
              />
              <CompactField
                label="Clinic name"
                value={careInfo?.contacts?.doctor_clinic || ''}
                placeholder="Children's Medical Group"
                onChange={(value) => updateField('contacts', 'doctor_clinic', value)}
              />
              <CompactField
                label="Phone"
                value={careInfo?.contacts?.doctor_phone || ''}
                placeholder="(555) 123-4567"
                onChange={(value) => updateField('contacts', 'doctor_phone', value)}
              />
            </div>

            {/* Other Contacts */}
            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Other emergency contacts"
                value={careInfo?.contacts?.emergency_contacts || ''}
                placeholder="Grandma: (555) 123-4567, Neighbor: (555) 765-4321"
                multiline
                rows={3}
                onChange={(value) => updateField('contacts', 'emergency_contacts', value)}
              />
              <CompactField
                label="Authorized pickup"
                value={careInfo?.contacts?.authorized_pickup || ''}
                placeholder="Grandma, Aunt Sarah, Neighbor Tom"
                multiline
                rows={2}
                onChange={(value) => updateField('contacts', 'authorized_pickup', value)}
              />
            </div>

            {/* Notes */}
            <div className="pt-4 border-t border-gray-100">
              <CompactField
                label="Other contact notes"
                value={careInfo?.contacts_notes || ''}
                placeholder="Any other contact details..."
                multiline
                rows={3}
                onChange={(value) => updateNotes('contacts', value)}
              />
            </div>
          </div>
        </SectionCard>
      </SectionGroup>
    </div>
  );
}
