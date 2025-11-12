'use client';

import { useState } from 'react';
import { X, Copy, Check, FileText, Home, Baby, School, Heart, User, Eye } from 'lucide-react';
import { generateGuide } from '@/lib/guideGenerator';
import ReactMarkdown from 'react-markdown';

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

interface ShareModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  children: Child[];
  childCareInfo: ChildCareInfo[];
  familyCareInfo: FamilyCareInfo | null;
  selectedChildId?: string;
}

type GuideType = 'child' | 'family' | 'babysitter' | 'school' | 'grandparent';

export default function ShareModalV2({
  isOpen,
  onClose,
  children,
  childCareInfo,
  familyCareInfo,
  selectedChildId
}: ShareModalV2Props) {
  const [selectedType, setSelectedType] = useState<GuideType>(
    selectedChildId ? 'child' : 'babysitter'
  );
  const [selectedChildForGuide, setSelectedChildForGuide] = useState<string>(
    selectedChildId || children[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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

  const generatePreviewGuide = () => {
    try {
      if (selectedType === 'child') {
        const child = children.find(c => c.id === selectedChildForGuide);
        const careInfo = childCareInfo.find(info => info.child_id === selectedChildForGuide);
        if (!child || !careInfo) return '';
        return generateGuide('child', { child, childCareInfo: careInfo });
      } else if (selectedType === 'family') {
        if (!familyCareInfo) return '';
        return generateGuide('family', { familyInfo: familyCareInfo });
      } else {
        if (!familyCareInfo) return '';
        return generateGuide(selectedType, {
          children,
          childCareInfos: childCareInfo,
          familyInfo: familyCareInfo
        });
      }
    } catch (error) {
      return 'Error generating guide preview';
    }
  };

  const handleCopy = async () => {
    try {
      const guide = generatePreviewGuide();
      if (!guide) {
        alert('No content to share');
        return;
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
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-sage" />
            <div>
              <h2 className="text-xl font-serif text-gray-900">Share Care Guide</h2>
              <p className="text-sm text-gray-600">Generate and copy formatted guide</p>
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
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Left Column - Settings */}
            <div className="space-y-6">
              {/* Guide Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Choose Guide Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {guideTypes.map(type => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;

                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? `border-sage ${type.bgColor}`
                            : 'border-sand hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${type.color} flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm">{type.name}</div>
                            <div className="text-xs text-gray-600">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Child Selection (if needed) */}
              {selectedGuideType?.needsChild && children.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Child
                  </label>
                  <div className="space-y-2">
                    {children.map(child => {
                      const isSelected = selectedChildForGuide === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => setSelectedChildForGuide(child.id)}
                          className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-rose bg-rose/5'
                              : 'border-sand hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {child.photo_url ? (
                              <img
                                src={child.photo_url}
                                alt={child.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center text-rose font-semibold">
                                {child.name.charAt(0)}
                              </div>
                            )}
                            <span className="font-medium text-gray-900">{child.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>What's included:</strong> Your guide will include all non-redacted information.
                  Any fields you've hidden (eye-off icon) will not appear.
                </p>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-900">
                  Preview
                </label>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-sage hover:text-sage/80 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>

              {showPreview ? (
                <div className="bg-gray-50 rounded-xl border border-sand p-4 max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900">
                    <ReactMarkdown>{generatePreviewGuide()}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl border border-sand p-12 flex flex-col items-center justify-center text-center">
                  <FileText className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">
                    Click "Show Preview" to see<br />what will be copied
                  </p>
                </div>
              )}
            </div>
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
