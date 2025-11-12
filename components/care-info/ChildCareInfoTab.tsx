'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Sun, Moon, Utensils, Heart, Shield, Phone, Check, Undo, ChevronDown, ChevronUp, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import RoutinesSection from './sections/RoutinesSection';
import HealthSection from './sections/HealthSection';
import ComfortSection from './sections/ComfortSection';
import SafetySection from './sections/SafetySection';
import ContactsSection from './sections/ContactsSection';

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

interface ChildCareInfoTabProps {
  child: Child;
  careInfo: ChildCareInfo | undefined;
  onUpdate: (info: ChildCareInfo) => void;
}

type SectionType = 'routines' | 'health' | 'comfort' | 'safety' | 'contacts';

interface SaveState {
  section: SectionType | null;
  status: 'idle' | 'saving' | 'saved' | 'error';
  timestamp?: number;
}

export default function ChildCareInfoTab({ child, careInfo: initialCareInfo, onUpdate }: ChildCareInfoTabProps) {
  const supabase = createClient();

  // Local state
  const [careInfo, setCareInfo] = useState(initialCareInfo);
  const [saveState, setSaveState] = useState<SaveState>({ section: null, status: 'idle' });
  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(new Set(['routines']));
  const [undoStack, setUndoStack] = useState<Array<{ section: SectionType; data: any; timestamp: number }>>([]);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Refs for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state when prop changes (when switching between children)
  useEffect(() => {
    // Clear any pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    // Reset state for the new child
    setCareInfo(initialCareInfo);
    setUndoStack([]);
    setShowUndoToast(false);
    setSaveState({ section: null, status: 'idle' });
  }, [child.id, initialCareInfo]);

  // Initialize care info if it doesn't exist
  useEffect(() => {
    if (!careInfo) {
      const initializeCareInfo = async () => {
        // First, check if care info already exists for this child
        const { data: existing } = await supabase
          .from('child_care_info')
          .select('*')
          .eq('child_id', child.id)
          .single();

        if (existing) {
          // Use existing data
          setCareInfo(existing);
          onUpdate(existing);
        } else {
          // Create new care info
          const { data, error } = await supabase
            .from('child_care_info')
            .insert({
              child_id: child.id,
              routines: {},
              health: {},
              comfort: {},
              safety: {},
              contacts: {},
            })
            .select()
            .single();

          if (!error && data) {
            setCareInfo(data);
            onUpdate(data);
          }
        }
      };

      initializeCareInfo();
    }
  }, [child.id, careInfo, supabase, onUpdate]);

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
        .from('child_care_info')
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

  // Update section data with autosave and undo tracking
  const updateSection = useCallback((section: SectionType, field: string, value: any) => {
    if (!careInfo) return;

    setCareInfo(prev => {
      if (!prev) return prev;

      const currentData = prev[section] || {};
      const newData = { ...currentData, [field]: value };

      // Add to undo stack
      const undoEntry = {
        section,
        data: currentData,
        timestamp: Date.now(),
      };

      setUndoStack(prevStack => {
        const newStack = [...prevStack, undoEntry];
        // Keep only last 5 changes
        return newStack.slice(-5);
      });

      // Show undo toast
      setShowUndoToast(true);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        setShowUndoToast(false);
      }, 10000);

      // Debounced save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveSection(section, newData, prev[`${section}_notes`] || null);
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

      // Debounced save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveSection(section, prev[section] || {}, notes);
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
    { id: 'routines', title: 'Routines', icon: Clock, description: 'Wake, naps, meals, bedtime', color: 'text-blue-600' },
    { id: 'health', title: 'Health', icon: Heart, description: 'Allergies, medications, conditions', color: 'text-red-600' },
    { id: 'comfort', title: 'Comfort', icon: Sun, description: 'Calming tips, favorites, dislikes', color: 'text-amber-600' },
    { id: 'safety', title: 'Safety', icon: Shield, description: 'Dos, donts, important warnings', color: 'text-green-600' },
    { id: 'contacts', title: 'Contacts', icon: Phone, description: 'Pediatrician, emergency contacts', color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Header with child info */}
      <div className="bg-white rounded-xl border border-sand p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {child.photo_url ? (
            <img
              src={child.photo_url}
              alt={child.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center">
              <span className="text-2xl font-serif text-sage">{child.name[0]}</span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-serif text-gray-900">{child.name}</h2>
            <p className="text-sm text-gray-600">
              Complete these sections to create care guides
            </p>
          </div>
        </div>

        {/* Save All Button */}
        <button
          onClick={() => {
            // Clear any pending autosave
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

            // Save all sections
            const sections: SectionType[] = ['routines', 'health', 'comfort', 'safety', 'contacts'];
            sections.forEach(section => {
              saveSection(section, careInfo[section] || {}, careInfo[`${section}_notes`] || null);
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-lg hover:bg-sage/90 transition-colors text-sm font-medium flex-shrink-0"
        >
          <Check className="w-4 h-4" />
          Save All
        </button>
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
                {section.id === 'routines' && (
                  <RoutinesSection
                    data={careInfo.routines}
                    notes={careInfo.routines_notes || ''}
                    redactedFields={careInfo.routines_redacted_fields || []}
                    childBirthdate={child.birthdate}
                    onUpdate={(field, value) => updateSection('routines', field, value)}
                    onNotesUpdate={(notes) => updateNotes('routines', notes)}
                    onRedactionToggle={(field) => {
                      // Handle redaction toggle
                      const current = careInfo.routines_redacted_fields || [];
                      const updated = current.includes(field)
                        ? current.filter((f: string) => f !== field)
                        : [...current, field];

                      setCareInfo(prev => prev ? { ...prev, routines_redacted_fields: updated } : prev);

                      // Save immediately
                      if (careInfo) {
                        supabase
                          .from('child_care_info')
                          .update({ routines_redacted_fields: updated })
                          .eq('id', careInfo.id)
                          .then();
                      }
                    }}
                  />
                )}

                {section.id === 'health' && (
                  <HealthSection
                    data={careInfo.health}
                    notes={careInfo.health_notes || ''}
                    redactedFields={careInfo.health_redacted_fields || []}
                    childBirthdate={child.birthdate}
                    onUpdate={(field, value) => updateSection('health', field, value)}
                    onNotesUpdate={(notes) => updateNotes('health', notes)}
                    onRedactionToggle={(field) => {
                      const current = careInfo.health_redacted_fields || [];
                      const updated = current.includes(field)
                        ? current.filter((f: string) => f !== field)
                        : [...current, field];

                      setCareInfo(prev => prev ? { ...prev, health_redacted_fields: updated } : prev);

                      if (careInfo) {
                        supabase
                          .from('child_care_info')
                          .update({ health_redacted_fields: updated })
                          .eq('id', careInfo.id)
                          .then();
                      }
                    }}
                  />
                )}

                {section.id === 'comfort' && (
                  <ComfortSection
                    data={careInfo.comfort}
                    notes={careInfo.comfort_notes || ''}
                    redactedFields={careInfo.comfort_redacted_fields || []}
                    childBirthdate={child.birthdate}
                    onUpdate={(field, value) => updateSection('comfort', field, value)}
                    onNotesUpdate={(notes) => updateNotes('comfort', notes)}
                    onRedactionToggle={(field) => {
                      const current = careInfo.comfort_redacted_fields || [];
                      const updated = current.includes(field)
                        ? current.filter((f: string) => f !== field)
                        : [...current, field];

                      setCareInfo(prev => prev ? { ...prev, comfort_redacted_fields: updated } : prev);

                      if (careInfo) {
                        supabase
                          .from('child_care_info')
                          .update({ comfort_redacted_fields: updated })
                          .eq('id', careInfo.id)
                          .then();
                      }
                    }}
                  />
                )}

                {section.id === 'safety' && (
                  <SafetySection
                    data={careInfo.safety}
                    notes={careInfo.safety_notes || ''}
                    redactedFields={careInfo.safety_redacted_fields || []}
                    childBirthdate={child.birthdate}
                    onUpdate={(field, value) => updateSection('safety', field, value)}
                    onNotesUpdate={(notes) => updateNotes('safety', notes)}
                    onRedactionToggle={(field) => {
                      const current = careInfo.safety_redacted_fields || [];
                      const updated = current.includes(field)
                        ? current.filter((f: string) => f !== field)
                        : [...current, field];

                      setCareInfo(prev => prev ? { ...prev, safety_redacted_fields: updated } : prev);

                      if (careInfo) {
                        supabase
                          .from('child_care_info')
                          .update({ safety_redacted_fields: updated })
                          .eq('id', careInfo.id)
                          .then();
                      }
                    }}
                  />
                )}

                {section.id === 'contacts' && (
                  <ContactsSection
                    data={careInfo.contacts}
                    notes={careInfo.contacts_notes || ''}
                    redactedFields={careInfo.contacts_redacted_fields || []}
                    childBirthdate={child.birthdate}
                    onUpdate={(field, value) => updateSection('contacts', field, value)}
                    onNotesUpdate={(notes) => updateNotes('contacts', notes)}
                    onRedactionToggle={(field) => {
                      const current = careInfo.contacts_redacted_fields || [];
                      const updated = current.includes(field)
                        ? current.filter((f: string) => f !== field)
                        : [...current, field];

                      setCareInfo(prev => prev ? { ...prev, contacts_redacted_fields: updated } : prev);

                      if (careInfo) {
                        supabase
                          .from('child_care_info')
                          .update({ contacts_redacted_fields: updated })
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
