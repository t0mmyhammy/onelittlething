'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface OnboardingChecklistProps {
  userId: string;
  familyName: string;
  hasChildren: boolean;
  hasMoments: boolean;
  hasPartner: boolean;
  isFamilyCreator: boolean;
}

export default function OnboardingChecklist({
  userId,
  familyName,
  hasChildren,
  hasMoments,
  hasPartner,
  isFamilyCreator,
}: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const supabase = createClient();

  // If they joined an existing family, show simple welcome
  if (!isFamilyCreator) {
    return (
      <div className="bg-gradient-to-r from-sage/20 to-rose/20 rounded-2xl p-6 border border-sage/30 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-6 h-6 text-sage" />
              <h3 className="text-xl font-serif text-gray-900">Welcome to {familyName}!</h3>
            </div>
            <p className="text-gray-700 mb-4">
              You've joined the family. Start exploring and capturing moments together.
            </p>
            <div className="flex gap-3">
              <Link
                href="/timeline"
                className="px-4 py-2 bg-sage text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                View Timeline
              </Link>
              <Link
                href="/sizes"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Explore Features
              </Link>
            </div>
          </div>
          <button
            onClick={async () => {
              await supabase
                .from('user_preferences')
                .update({ onboarding_dismissed: true })
                .eq('user_id', userId);
              setIsDismissed(true);
            }}
            className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Check if all core steps are complete
  const coreStepsComplete = hasChildren;
  const allStepsComplete = hasChildren && hasMoments && hasPartner;

  // Calculate progress
  const steps = [
    { id: 'child', label: 'Add your first child', completed: hasChildren, required: true, link: '/settings#family' },
    { id: 'moment', label: 'Capture your first moment', completed: hasMoments, required: false, link: '/dashboard' },
    { id: 'partner', label: 'Invite your partner', completed: hasPartner, required: false, link: '/settings#family' },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const totalCount = steps.length;
  const progressPercent = (completedCount / totalCount) * 100;

  if (isDismissed) return null;

  const handleDismiss = async () => {
    if (!coreStepsComplete) {
      return; // Can't dismiss until core steps are done
    }

    await supabase
      .from('user_preferences')
      .update({
        onboarding_dismissed: true,
        onboarding_completed: allStepsComplete
      })
      .eq('user_id', userId);

    setIsDismissed(true);
  };

  return (
    <div className="bg-gradient-to-r from-sage/20 to-rose/20 rounded-2xl p-6 border border-sage/30 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <SparklesIcon className="w-6 h-6 text-sage" />
            <h3 className="text-xl font-serif text-gray-900">
              {allStepsComplete ? '🎉 You\'re all set!' : 'Get Started with OneLittleThing'}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {allStepsComplete
              ? 'You\'ve completed all the setup steps. Start capturing beautiful moments!'
              : 'Complete these steps to get the most out of your family journal'}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          disabled={!coreStepsComplete}
          className={`ml-4 p-1 transition-colors ${
            coreStepsComplete
              ? 'text-gray-400 hover:text-gray-600 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          aria-label={coreStepsComplete ? 'Dismiss' : 'Complete required steps first'}
          title={coreStepsComplete ? 'Dismiss' : 'Complete required steps first'}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">
            {completedCount} of {totalCount} complete
          </span>
          <span className="text-gray-500">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-sage to-rose h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.completed ? '#' : step.link}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              step.completed
                ? 'bg-white/50'
                : 'bg-white hover:shadow-sm cursor-pointer'
            }`}
            onClick={(e) => step.completed && e.preventDefault()}
          >
            {step.completed ? (
              <CheckCircleSolid className="w-6 h-6 text-sage flex-shrink-0" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
            )}
            <div className="flex-1">
              <span className={`font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                {step.label}
              </span>
              {step.required && !step.completed && (
                <span className="ml-2 text-xs text-rose font-medium">Required</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {allStepsComplete && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-sage/20">
          <p className="text-sm text-gray-700 text-center">
            ✨ Great job! You can dismiss this message or keep it as a reference.
          </p>
        </div>
      )}
    </div>
  );
}
