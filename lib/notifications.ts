import { NotificationType } from '@/components/NotificationBanner';

interface NotificationConditions {
  userId: string;
  isFamilyCreator: boolean;
  accountAgeDays: number;
  hasChildren: boolean;
  hasMoments: boolean;
  hasPartner: boolean;
  dismissedNotifications: Set<string>;
  familyName: string;
}

export interface NotificationConfig {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  icon: 'sparkles' | 'megaphone' | 'lightbulb' | 'check';
  gradient: string;
  dismissible: boolean;
  priority: number; // Higher = shown first
  shouldShow: (conditions: NotificationConditions) => boolean;
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

export function getActiveNotifications(conditions: NotificationConditions): NotificationConfig[] {
  const allNotifications: NotificationConfig[] = [
    // Welcome message for users joining existing family
    {
      id: 'welcome_family_member',
      type: 'welcome_family_member',
      title: `Welcome to ${conditions.familyName}!`,
      description: "You've joined the family. Start exploring and capturing moments together.",
      icon: 'sparkles',
      gradient: 'from-sage/20 to-rose/20',
      dismissible: true,
      priority: 100,
      shouldShow: (c) =>
        !c.isFamilyCreator &&
        c.accountAgeDays < 7 &&
        !c.dismissedNotifications.has('welcome_family_member'),
      actions: [
        { label: 'View Timeline', href: '/timeline', style: 'primary' },
        { label: 'Explore Features', href: '/sizes', style: 'secondary' },
      ],
    },

    // Onboarding checklist for family creators
    {
      id: 'onboarding_checklist',
      type: 'onboarding_checklist',
      title: conditions.hasChildren && conditions.hasMoments && conditions.hasPartner
        ? '🎉 You\'re all set!'
        : 'Get Started with OneLittleThing',
      description: conditions.hasChildren && conditions.hasMoments && conditions.hasPartner
        ? 'You\'ve completed all the setup steps. Start capturing beautiful moments!'
        : 'Complete these steps to get the most out of your family journal',
      icon: 'sparkles',
      gradient: 'from-sage/20 to-rose/20',
      dismissible: true,
      priority: 90,
      shouldShow: (c) =>
        c.isFamilyCreator &&
        !c.dismissedNotifications.has('onboarding_checklist'),
      showProgress: true,
      checklist: [
        {
          id: 'child',
          label: 'Add your first child',
          completed: conditions.hasChildren,
          // Only required for brand new users (first 3 days)
          required: conditions.accountAgeDays < 3,
          link: '/settings#family',
        },
        {
          id: 'moment',
          label: 'Capture your first moment',
          completed: conditions.hasMoments,
          required: false,
          link: '/dashboard',
        },
        {
          id: 'partner',
          label: 'Invite your partner',
          completed: conditions.hasPartner,
          required: false,
          link: '/settings#family',
        },
      ],
    },

    // Example: Feature announcement (commented out, enable when needed)
    // {
    //   id: 'feature_care_guides',
    //   type: 'feature_announcement',
    //   title: '✨ New Feature: Care Guides',
    //   description: 'Create and share care guides for babysitters, grandparents, and family members.',
    //   icon: 'megaphone',
    //   gradient: 'from-blue-100 to-purple-100',
    //   dismissible: true,
    //   priority: 80,
    //   shouldShow: (c) =>
    //     c.accountAgeDays >= 7 &&
    //     c.hasChildren &&
    //     !c.dismissedNotifications.has('feature_care_guides'),
    //   actions: [
    //     { label: 'Try Care Guides', href: '/care-guides', style: 'primary' },
    //     { label: 'Learn More', href: '/care-guides', style: 'secondary' },
    //   ],
    // },

    // Example: Milestone celebration (commented out)
    // {
    //   id: 'milestone_10_moments',
    //   type: 'milestone',
    //   title: '🎊 10 Moments Captured!',
    //   description: "You're building a beautiful record of your family's journey. Keep it up!",
    //   icon: 'check',
    //   gradient: 'from-green-100 to-teal-100',
    //   dismissible: true,
    //   priority: 70,
    //   shouldShow: (c) =>
    //     c.hasMoments &&
    //     !c.dismissedNotifications.has('milestone_10_moments'),
    //   actions: [
    //     { label: 'View Timeline', href: '/timeline', style: 'primary' },
    //   ],
    // },

    // Example: Helpful tip (commented out)
    // {
    //   id: 'tip_sizes_tracking',
    //   type: 'tip',
    //   title: '💡 Tip: Track Sizes & Needs',
    //   description: 'Never forget what size clothes your kids wear or what items they need.',
    //   icon: 'lightbulb',
    //   gradient: 'from-amber-100 to-orange-100',
    //   dismissible: true,
    //   priority: 60,
    //   shouldShow: (c) =>
    //     c.hasChildren &&
    //     c.accountAgeDays >= 3 &&
    //     !c.dismissedNotifications.has('tip_sizes_tracking'),
    //   actions: [
    //     { label: 'Open Sizes & Needs', href: '/sizes', style: 'primary' },
    //     { label: 'Maybe Later', href: '#', style: 'secondary' },
    //   ],
    // },
  ];

  // Filter notifications that should show and sort by priority
  return allNotifications
    .filter(notification => notification.shouldShow(conditions))
    .sort((a, b) => b.priority - a.priority);
}
