'use client';

import { useState } from 'react';
import { X, Copy, Check, FileText, Home, Baby, School, Heart } from 'lucide-react';
import { generateGuide } from '@/lib/guideGenerator';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
}

interface ChildCareInfo {
  id: string;
  child_id: string;
  routines: any;
  routines_notes: string | null;
  routines_redacted_fields: string[];
  health: any;
  health_notes: string | null;
  health_redacted_fields: string[];
  comfort: any;
  comfort_notes: string | null;
  comfort_redacted_fields: string[];
  safety: any;
  safety_notes: string | null;
  safety_redacted_fields: string[];
  contacts: any;
  contacts_notes: string | null;
  contacts_redacted_fields: string[];
}

interface FamilyCareInfo {
  id: string;
  family_id: string;
  home_base: any;
  home_base_notes: string | null;
  home_base_redacted_fields: string[];
  house_rules: any;
  house_rules_notes: string | null;
  house_rules_redacted_fields: string[];
  schedule: any;
  schedule_notes: string | null;
  schedule_redacted_fields: string[];
  emergency: any;
  emergency_notes: string | null;
  emergency_redacted_fields: string[];
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: Child[];
  childCareInfo: ChildCareInfo[];
  familyCareInfo: FamilyCareInfo | null;
  selectedChildId?: string; // If sharing from a specific child tab
}

type GuideType = 'child' | 'family' | 'babysitter' | 'school' | 'grandparent';

export default function ShareModal({
  isOpen,
  onClose,
  children,
  childCareInfo,
  familyCareInfo,
  selectedChildId
}: ShareModalProps) {
  const [selectedType, setSelectedType] = useState<GuideType>(
    selectedChildId ? 'child' : 'babysitter'
  );
  const [selectedChildForGuide, setSelectedChildForGuide] = useState<string>(
    selectedChildId || children[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const guideTypes = [
    {
      id: 'child' as GuideType,
      name: 'Child Guide',
      description: 'Complete info for one child',
      icon: Baby,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      needsChild: true
    },
    {
      id: 'family' as GuideType,
      name: 'Family Guide',
      description: 'Family-wide info only',
      icon: Home,
      color: 'text-sage',
      bgColor: 'bg-sage/10'
    },
    {
      id: 'babysitter' as GuideType,
      name: 'Babysitter Pack',
      description: 'Essential info for sitters',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'school' as GuideType,
      name: 'School/Daycare',
      description: 'Info for teachers',
      icon: School,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'grandparent' as GuideType,
      name: 'Grandparent Pack',
      description: 'Info for extended family',
      icon: Heart,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const handleCopy = async () => {
    try {
      let guide = '';

      if (selectedType === 'child') {
        const child = children.find(c => c.id === selectedChildForGuide);
        const careInfo = childCareInfo.find(info => info.child_id === selectedChildForGuide);

        if (!child || !careInfo) {
          alert('Please select a child');
          return;
        }

        guide = generateGuide('child', { child, childCareInfo: careInfo });
      } else if (selectedType === 'family') {
        if (!familyCareInfo) {
          alert('No family info available');
          return;
        }

        guide = generateGuide('family', { familyInfo: familyCareInfo });
      } else {
        // Babysitter, school, grandparent packs
        if (!familyCareInfo) {
          alert('Family info required');
          return;
        }

        guide = generateGuide(selectedType, {
          children,
          childCareInfos: childCareInfo,
          familyInfo: familyCareInfo
        });
      }

      await navigator.clipboard.writeText(guide);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy. Please try again.');
    }
  };

  const selectedGuideType = guideTypes.find(t => t.id === selectedType);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-sage" />
            <div>
              <h2 className="text-xl font-serif text-gray-900">Share Care Guide</h2>
              <p className="text-sm text-gray-600">Generate and copy to clipboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Guide Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Choose Guide Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guideTypes.map(type => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;

                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? `border-sage ${type.bgColor}`
                        : 'border-sand hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${type.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{type.name}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Child Selection (if needed) */}
          {selectedGuideType?.needsChild && children.length > 1 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Child
              </label>
              <select
                value={selectedChildForGuide}
                onChange={(e) => setSelectedChildForGuide(e.target.value)}
                className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>What's included:</strong> Your guide will include all non-redacted information.
              Any fields you've hidden (eye-off icon) will not appear in the guide.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-sand bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-sage text-white hover:bg-sage/90'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Guide
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
