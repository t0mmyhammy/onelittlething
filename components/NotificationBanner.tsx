'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon, CheckCircleIcon, SparklesIcon, MegaphoneIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

export type NotificationType =
  | 'welcome_family_member'
  | 'onboarding_checklist'
  | 'feature_announcement'
  | 'tip'
  | 'milestone';

interface NotificationConfig {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  icon: 'sparkles' | 'megaphone' | 'lightbulb' | 'check';
  gradient: string;
  dismissible: boolean;
  actions?: Array<{
    label: string;
    href: string;
    style: 'primary' | 'secondary';
  }>;
  checklist?: Array<{
    id: string;
    label: string;
    completed: boolean;
    required: boolean;
    link: string;
  }>;
  showProgress?: boolean;
}

interface NotificationBannerProps {
  userId: string;
  notifications: NotificationConfig[];
}

export default function NotificationBanner({ userId, notifications }: NotificationBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  // Show only the first non-dismissed notification
  const currentNotification = notifications.find(n => !dismissedIds.has(n.id));

  if (!currentNotification) return null;

  const handleDismiss = async (notificationId: string) => {
    // Save dismissal to database
    const dismissalKey = `notification_dismissed_${notificationId}`;

    // Fetch existing preferences to merge with
    const { data: existingPrefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Upsert with existing data merged with new dismissal
    await supabase
      .from('user_preferences')
      .upsert(
        {
          ...existingPrefs,
          user_id: userId,
          [dismissalKey]: true
        },
        { onConflict: 'user_id' }
      );

    setDismissedIds(prev => new Set([...prev, notificationId]));
  };

  const getIcon = () => {
    switch (currentNotification.icon) {
      case 'sparkles':
        return <SparklesIcon className="w-6 h-6" />;
      case 'megaphone':
        return <MegaphoneIcon className="w-6 h-6" />;
      case 'lightbulb':
        return <LightBulbIcon className="w-6 h-6" />;
      case 'check':
        return <CheckCircleSolid className="w-6 h-6" />;
      default:
        return <SparklesIcon className="w-6 h-6" />;
    }
  };

  const getGradientClass = () => {
    return currentNotification.gradient || 'from-sage/20 to-rose/20';
  };

  const getIconColor = () => {
    switch (currentNotification.icon) {
      case 'sparkles':
        return 'text-sage';
      case 'megaphone':
        return 'text-rose';
      case 'lightbulb':
        return 'text-amber-600';
      case 'check':
        return 'text-green-600';
      default:
        return 'text-sage';
    }
  };

  // Calculate progress if checklist exists
  let progressPercent = 0;
  if (currentNotification.checklist && currentNotification.showProgress) {
    const completed = currentNotification.checklist.filter(item => item.completed).length;
    const total = currentNotification.checklist.length;
    progressPercent = (completed / total) * 100;
  }

  // Check if core requirements are met for dismissal
  const canDismiss = currentNotification.dismissible && (
    !currentNotification.checklist ||
    currentNotification.checklist.filter(item => item.required).every(item => item.completed)
  );

  return (
    <div className={`bg-gradient-to-r ${getGradientClass()} rounded-2xl p-6 border border-sage/30 mb-6 animate-fadeSlideIn`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={getIconColor()}>
              {getIcon()}
            </div>
            <h3 className="text-xl font-serif text-gray-900">
              {currentNotification.title}
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            {currentNotification.description}
          </p>

          {/* Progress Bar */}
          {currentNotification.showProgress && currentNotification.checklist && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">
                  {currentNotification.checklist.filter(item => item.completed).length} of {currentNotification.checklist.length} complete
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
          )}

          {/* Checklist */}
          {currentNotification.checklist && (
            <div className="space-y-2 mb-4">
              {currentNotification.checklist.map((item) => (
                <Link
                  key={item.id}
                  href={item.completed ? '#' : item.link}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    item.completed
                      ? 'bg-white/50'
                      : 'bg-white hover:shadow-sm cursor-pointer'
                  }`}
                  onClick={(e) => item.completed && e.preventDefault()}
                >
                  {item.completed ? (
                    <CheckCircleSolid className="w-6 h-6 text-sage flex-shrink-0" />
                  ) : (
                    <CheckCircleIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <span className={`font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {item.label}
                    </span>
                    {item.required && !item.completed && (
                      <span className="ml-2 text-xs text-rose font-medium">Required</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {currentNotification.actions && (
            <div className="flex gap-3">
              {currentNotification.actions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className={`px-4 py-2 rounded-lg transition-opacity text-sm font-medium ${
                    action.style === 'primary'
                      ? 'bg-sage text-white hover:opacity-90'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => handleDismiss(currentNotification.id)}
          disabled={!canDismiss}
          className={`ml-4 p-1 transition-colors ${
            canDismiss
              ? 'text-gray-400 hover:text-gray-600 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          aria-label={canDismiss ? 'Dismiss' : 'Complete required steps first'}
          title={canDismiss ? 'Dismiss' : 'Complete required steps first'}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
