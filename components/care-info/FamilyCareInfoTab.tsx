'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Home, BookOpen, Calendar, AlertTriangle, Check, Undo, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import HomeBaseSection from './sections/HomeBaseSection';
import HouseRulesSection from './sections/HouseRulesSection';
import ScheduleSection from './sections/ScheduleSection';
import EmergencySection from './sections/EmergencySection';

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

interface FamilyCareInfoTabProps {
  familyId: string;
  familyCareInfo: FamilyCareInfo | null;
  onUpdate: (info: FamilyCareInfo) => void;
}

type SectionType = 'home_base' | 'house_rules' | 'schedule' | 'emergency';

interface SaveState {
  section: SectionType | null;
  status: 'idle' | 'saving' | 'saved' | 'error';
  timestamp?: number;
}

export default function FamilyCareInfoTab({ familyId, familyCareInfo: initialCareInfo, onUpdate }: FamilyCareInfoTabProps) {
  const supabase = createClient();

  // Local state
  const [careInfo, setCareInfo] = useState(initialCareInfo);
  const [saveState, setSaveState] = useState<SaveState>({ section: null, status: 'idle' });
  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(new Set(['home_base']));
  const [undoStack, setUndoStack] = useState<Array<{ section: SectionType; data: any; timestamp: number }>>([]);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Refs for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<{ section: SectionType; data: any; notes: string | null } | null>(null);

  // Cleanup: Flush any pending saves when component unmounts (e.g., switching tabs)
  useEffect(() => {
    return () => {
      // Clear timers
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }

      // If there's pending data, save it immediately
      if (pendingSaveRef.current && careInfo) {
        const { section, data, notes } = pendingSaveRef.current;
        const updateData: any = {
          [`${section}`]: data,
          [`${section}_notes`]: notes,
          [`${section}_updated_at`]: new Date().toISOString(),
        };

        // Fire and forget - we can't await in cleanup
        supabase
          .from('family_care_info')
          .update(updateData)
          .eq('id', careInfo.id)
          .then();
      }
    };
  }, [careInfo, supabase]);

  // Initialize care info if it doesn't exist
  useEffect(() => {
    if (!careInfo) {
      const initializeCareInfo = async () => {
        const { data, error } = await supabase
          .from('family_care_info')
          .insert({
            family_id: familyId,
            home_base: {},
            house_rules: {},
            schedule: {},
            emergency: {},
          })
          .select()
          .single();

        if (!error && data) {
          setCareInfo(data);
          onUpdate(data);
        }
      };

      initializeCareInfo();
    }
  }, [familyId, careInfo, supabase, onUpdate]);

  // Debounced autosave
  const saveSection = useCallback(async (section: SectionType, data: any, notes: string | null) => {
    if (!careInfo) return;

    setSaveState({ section, status: 'saving' });

    try {
      const updateData: any = {
        [`${section}`]: data,
        [`${section}_notes`]: notes,
        [`${section}_updated_at`]: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('family_care_info')
        .update(updateData)
        .eq('id', careInfo.id);

      if (error) throw error;

      setSaveState({ section, status: 'saved', timestamp: Date.now() });

      // Hide "Saved" indicator after 2 seconds
      setTimeout(() => {
        setSaveState(prev => prev.section === section ? { section: null, status: 'idle' } : prev);
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveState({ section, status: 'error' });
    }
  }, [careInfo, supabase]);

  // Update section field
  const updateSection = useCallback((section: SectionType, field: string, value: any) => {
    if (!careInfo) return;

    setCareInfo(prev => {
      if (!prev) return prev;

      const currentData = prev[section] || {};
      const newData = { ...currentData, [field]: value };

      // Add to undo stack
      setUndoStack(prevStack => [...prevStack, { section, data: currentData, timestamp: Date.now() }].slice(-5));
      setShowUndoToast(true);

      // Hide undo toast after 10 seconds
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => setShowUndoToast(false), 10000);

      // Track pending save
      const notes = prev[`${section}_notes`] || null;
      pendingSaveRef.current = { section, data: newData, notes };

      // Debounced save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveSection(section, newData, notes);
        pendingSaveRef.current = null; // Clear after save
      }, 1000);

      return {
        ...prev,
        [section]: newData,
      };
    });
  }, [careInfo, saveSection]);

  // Update section notes
  const updateNotes = useCallback((section: SectionType, notes: string) => {
    if (!careInfo) return;

    setCareInfo(prev => {
      if (!prev) return prev;

      const data = prev[section] || {};

      // Track pending save
      pendingSaveRef.current = { section, data, notes };

      // Debounced save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveSection(section, data, notes);
        pendingSaveRef.current = null; // Clear after save
      }, 1000);

      return {
        ...prev,
        [`${section}_notes`]: notes,
      };
    });
  }, [careInfo, saveSection]);

  // Undo last change
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastChange = undoStack[undoStack.length - 1];
    const now = Date.now();

    // Only allow undo within 10 seconds
    if (now - lastChange.timestamp > 10000) {
      setShowUndoToast(false);
      return;
    }

    setCareInfo(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [lastChange.section]: lastChange.data,
      };
    });

    setUndoStack(prev => prev.slice(0, -1));
    setShowUndoToast(false);

    // Save the reverted state
    saveSection(lastChange.section, lastChange.data, careInfo?.[`${lastChange.section}_notes`] || null);
  }, [undoStack, careInfo, saveSection]);

  // Toggle section expansion
  const toggleSection = (section: SectionType) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (!careInfo) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  const sections: Array<{
    id: SectionType;
    title: string;
    icon: any;
    description: string;
    color: string;
  }> = [
    { id: 'home_base', title: 'Home Base', icon: Home, description: 'Address, Wi-Fi, door codes, parking', color: 'text-blue-600' },
    { id: 'house_rules', title: 'House Rules', icon: BookOpen, description: 'Screens, snacks, pets, visitors', color: 'text-purple-600' },
    { id: 'schedule', title: 'Schedule', icon: Calendar, description: 'School hours, activities, pickup times', color: 'text-green-600' },
    { id: 'emergency', title: 'Emergency', icon: AlertTriangle, description: 'Plan, nearest hospital, insurance', color: 'text-red-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-sand p-4">
        <h2 className="text-xl font-serif text-gray-900 mb-1">Family Information</h2>
        <p className="text-sm text-gray-600">
          Details that apply to your whole household
        </p>
      </div>

      {/* Sections */}
      {sections.map(section => {
        const Icon = section.icon;
        const isExpanded = expandedSections.has(section.id);
        const isSaving = saveState.section === section.id && saveState.status === 'saving';
        const isSaved = saveState.section === section.id && saveState.status === 'saved';
        const hasData = careInfo[section.id] && Object.keys(careInfo[section.id]).length > 0;
        const updatedAt = careInfo[`${section.id}_updated_at`];

        return (
          <div
            key={section.id}
            className="bg-white rounded-xl border border-sand overflow-hidden transition-shadow hover:shadow-md"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className={`w-5 h-5 ${section.color}`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Save status */}
                {isSaving && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                )}
                {isSaved && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Saved
                  </span>
                )}

                {/* Last updated */}
                {updatedAt && !isSaving && !isSaved && (
                  <span className="text-xs text-gray-400">
                    {new Date(updatedAt).toLocaleDateString()}
                  </span>
                )}

                {/* Completion badge */}
                {!hasData && (
                  <span className="text-xs px-2 py-1 bg-amber/10 text-amber rounded-full">
                    Not started
                  </span>
                )}

                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="px-6 pb-6 pt-2 border-t border-sand">
                {section.id === 'home_base' && (
                  <HomeBaseSection
                    data={careInfo.home_base}
                    notes={careInfo.home_base_notes || ''}
                    redactedFields={careInfo.home_base_redacted_fields || []}
                    onUpdate={(field, value) => updateSection('home_base', field, value)}
                    onNotesUpdate={(notes) => updateNotes('home_base', notes)}
                    onRedactionToggle={(field) => {
                      const current = careInfo.home_base_redacted_fields || [];
                      const updated = current.includes(field)
                        ? current.filter((f: string) => f !== field)
                        : [...current, field];

                      setCareInfo(prev => prev ? { ...prev, home_base_redacted_fields: updated } : prev);

                      if (careInfo) {
                        supabase
                          .from('family_care_info')
                          .update({ home_base_redacted_fields: updated })
                          .eq('id', careInfo.id)
                          .then();
                      }
                    }}
                  />
                )}

                {section.id === 'house_rules' && (
                  <HouseRulesSection
                    data={careInfo.house_rules}
                    notes={careInfo.house_rules_notes || ''}
                    redactedFields={careInfo.house_rules_redacted_fields || []}
                    onUpdate={(field, value) => updateSection('house_rules', field, value)}
                    onNotesUpdate={(notes) => updateNotes('house_rules', notes)}
                    onRedactionToggle={(field) => {
                      const current = careInfo.house_rules_redacted_fields || [];
                      const updated = current.includes(field)
                        ? current.filter((f: string) => f !== field)
                        : [...current, field];

                      setCareInfo(prev => prev ? { ...prev, house_rules_redacted_fields: updated } : prev);

                      if (careInfo) {
                        supabase
                          .from('family_care_info')
                          .update({ house_rules_redacted_fields: updated })
                          .eq('id', careInfo.id)
                          .then();
                      }
                    }}
                  />
                )}

                {section.id === 'schedule' && (
                  <ScheduleSection
                    data={careInfo.schedule}
                    notes={careInfo.schedule_notes || ''}
                    redactedFields={careInfo.schedule_redacted_fields || []}
                    onUpdate={(field, value) => updateSection('schedule', field, value)}
                    onNotesUpdate={(notes) => updateNotes('schedule', notes)}
                    onRedactionToggle={(field) => {
                      const current = careInfo.schedule_redacted_fields || [];
                      const updated = current.includes(field)
                        ? current.filter((f: string) => f !== field)
                        : [...current, field];

                      setCareInfo(prev => prev ? { ...prev, schedule_redacted_fields: updated } : prev);

                      if (careInfo) {
                        supabase
                          .from('family_care_info')
                          .update({ schedule_redacted_fields: updated })
                          .eq('id', careInfo.id)
                          .then();
                      }
                    }}
                  />
                )}

                {section.id === 'emergency' && (
                  <EmergencySection
                    data={careInfo.emergency}
                    notes={careInfo.emergency_notes || ''}
                    redactedFields={careInfo.emergency_redacted_fields || []}
                    onUpdate={(field, value) => updateSection('emergency', field, value)}
                    onNotesUpdate={(notes) => updateNotes('emergency', notes)}
                    onRedactionToggle={(field) => {
                      const current = careInfo.emergency_redacted_fields || [];
                      const updated = current.includes(field)
                        ? current.filter((f: string) => f !== field)
                        : [...current, field];

                      setCareInfo(prev => prev ? { ...prev, emergency_redacted_fields: updated } : prev);

                      if (careInfo) {
                        supabase
                          .from('family_care_info')
                          .update({ emergency_redacted_fields: updated })
                          .eq('id', careInfo.id)
                          .then();
                      }
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Undo Toast */}
      {showUndoToast && undoStack.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50 animate-fade-in">
          <span className="text-sm">Changes saved</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-sm font-medium hover:text-gray-200 transition-colors"
          >
            <Undo className="w-4 h-4" />
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
