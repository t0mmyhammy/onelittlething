'use client';

import { useState, useEffect } from 'react';
import { User, Baby, Home, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ChildCareInfoTab from './care-info/ChildCareInfoTab';
import FamilyCareInfoTab from './care-info/FamilyCareInfoTab';

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

interface CareInfoPageClientProps {
  children: Child[];
  childCareInfo: ChildCareInfo[];
  familyCareInfo: FamilyCareInfo | null;
  familyId: string;
}

type TabType = 'family' | string; // 'family' or child ID

export default function CareInfoPageClient({
  children,
  childCareInfo: initialChildCareInfo,
  familyCareInfo: initialFamilyCareInfo,
  familyId,
}: CareInfoPageClientProps) {
  const supabase = createClient();

  // Tab state - default to first child or family
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careInfoActiveTab');
      if (saved) {
        // Validate that the saved tab still exists
        if (saved === 'family' || children.find(c => c.id === saved)) {
          return saved;
        }
      }
    }
    return children[0]?.id || 'family';
  });

  // Local state for data
  const [childCareInfo, setChildCareInfo] = useState<ChildCareInfo[]>(initialChildCareInfo);
  const [familyCareInfo, setFamilyCareInfo] = useState<FamilyCareInfo | null>(initialFamilyCareInfo);

  // Persist tab selection
  useEffect(() => {
    localStorage.setItem('careInfoActiveTab', activeTab);
  }, [activeTab]);

  // Calculate completion status for badges
  const getChildCompletionStatus = (childId: string) => {
    const info = childCareInfo.find(i => i.child_id === childId);
    if (!info) return { complete: 0, total: 5 };

    let complete = 0;
    if (info.routines && Object.keys(info.routines).length > 0) complete++;
    if (info.health && Object.keys(info.health).length > 0) complete++;
    if (info.comfort && Object.keys(info.comfort).length > 0) complete++;
    if (info.safety && Object.keys(info.safety).length > 0) complete++;
    if (info.contacts && Object.keys(info.contacts).length > 0) complete++;

    return { complete, total: 5 };
  };

  const getFamilyCompletionStatus = () => {
    if (!familyCareInfo) return { complete: 0, total: 4 };

    let complete = 0;
    if (familyCareInfo.home_base && Object.keys(familyCareInfo.home_base).length > 0) complete++;
    if (familyCareInfo.house_rules && Object.keys(familyCareInfo.house_rules).length > 0) complete++;
    if (familyCareInfo.schedule && Object.keys(familyCareInfo.schedule).length > 0) complete++;
    if (familyCareInfo.emergency && Object.keys(familyCareInfo.emergency).length > 0) complete++;

    return { complete, total: 4 };
  };

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sand p-8 text-center">
        <Baby className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-serif text-gray-900 mb-2">No children yet</h2>
        <p className="text-gray-600 mb-4">Add a child from settings to create care guides.</p>
        <a href="/settings" className="text-sage hover:text-rose font-medium">
          Go to Settings →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-sand overflow-hidden">
        <div className="flex items-center gap-2 p-2 overflow-x-auto">
          {/* Family tab */}
          <button
            onClick={() => setActiveTab('family')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'family'
                ? 'bg-gradient-to-r from-sage to-sage/90 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Family</span>
            {(() => {
              const status = getFamilyCompletionStatus();
              if (status.complete < status.total) {
                return (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'family'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber/20 text-amber'
                  }`}>
                    {status.complete}/{status.total}
                  </span>
                );
              }
              return null;
            })()}
          </button>

          {/* Child tabs */}
          {children.map(child => {
            const status = getChildCompletionStatus(child.id);
            const isActive = activeTab === child.id;

            return (
              <button
                key={child.id}
                onClick={() => setActiveTab(child.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-rose to-rose/90 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {child.photo_url ? (
                  <img
                    src={child.photo_url}
                    alt={child.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>{child.name}</span>
                {status.complete < status.total && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-amber/20 text-amber'
                  }`}>
                    {status.complete}/{status.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'family' ? (
        <FamilyCareInfoTab
          familyId={familyId}
          familyCareInfo={familyCareInfo}
          onUpdate={(updated) => setFamilyCareInfo(updated)}
        />
      ) : (
        (() => {
          const selectedChild = children.find(c => c.id === activeTab);
          if (!selectedChild) return null;

          const careInfo = childCareInfo.find(i => i.child_id === selectedChild.id);

          return (
            <ChildCareInfoTab
              child={selectedChild}
              careInfo={careInfo}
              onUpdate={(updated) => {
                setChildCareInfo(prev => {
                  const existing = prev.find(i => i.child_id === selectedChild.id);
                  if (existing) {
                    return prev.map(i => i.child_id === selectedChild.id ? updated : i);
                  } else {
                    return [...prev, updated];
                  }
                });
              }}
            />
          );
        })()
      )}
    </div>
  );
}
