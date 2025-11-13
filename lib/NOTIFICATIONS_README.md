# Notification Banner System

A flexible notification system for showing contextual messages to users based on account age, completion status, or feature announcements.

## Overview

The notification banner appears at the top of the dashboard and shows one notification at a time, prioritized by importance. Users can dismiss notifications (if allowed), and the system tracks dismissals in the database.

## Adding a New Notification

Edit `lib/notifications.ts` and add a new notification object to the `allNotifications` array:

```typescript
{
  id: 'unique_notification_id',
  type: 'feature_announcement', // or 'tip', 'milestone', etc.
  title: '✨ Feature Title',
  description: 'Brief description of what this notification is about.',
  icon: 'megaphone', // sparkles | megaphone | lightbulb | check
  gradient: 'from-blue-100 to-purple-100', // Tailwind gradient classes
  dismissible: true,
  priority: 75, // Higher = shown first (100 = highest)
  shouldShow: (c) =>
    c.hasChildren && // Only show if they have children
    c.accountAgeDays >= 7 && // Account at least 7 days old
    !c.dismissedNotifications.has('unique_notification_id'),
  actions: [
    { label: 'Primary Action', href: '/feature-path', style: 'primary' },
    { label: 'Secondary Action', href: '#', style: 'secondary' },
  ],
}
```

## Notification Types

- `welcome_family_member` - Shown to users joining existing family
- `onboarding_checklist` - Shown to family creators during setup
- `feature_announcement` - New feature launches
- `tip` - Helpful usage tips
- `milestone` - Celebrate user achievements

## Available Conditions

When writing `shouldShow` logic, you have access to:

```typescript
{
  userId: string;           // Current user's ID
  isFamilyCreator: boolean; // Did they create the family?
  accountAgeDays: number;   // Account age in days
  hasChildren: boolean;     // Have they added children?
  hasMoments: boolean;      // Have they captured moments?
  hasPartner: boolean;      // Have they invited others?
  dismissedNotifications: Set<string>; // IDs of dismissed notifications
  familyName: string;       // Name of their family
}
```

## Priority Guidelines

- **100-90**: Critical onboarding and welcome messages
- **89-80**: Important feature announcements
- **79-70**: Milestones and achievements
- **69-60**: Tips and suggestions
- **<60**: Low priority informational messages

## Icons and Gradients

**Available Icons:**
- `sparkles` (green) - Welcome, general positivity
- `megaphone` (rose) - Announcements, features
- `lightbulb` (amber) - Tips, suggestions
- `check` (green) - Milestones, completion

**Example Gradients:**
- `from-sage/20 to-rose/20` - Default, warm
- `from-blue-100 to-purple-100` - Feature announcements
- `from-amber-100 to-orange-100` - Tips
- `from-green-100 to-teal-100` - Milestones

## Checklists

For notifications with multiple steps:

```typescript
{
  showProgress: true,
  checklist: [
    {
      id: 'step_1',
      label: 'Do something',
      completed: conditions.hasChildren,
      required: true, // Must complete before dismissing
      link: '/where-to-do-it',
    },
    // More steps...
  ],
}
```

## Database

Dismissals are automatically tracked in `user_preferences` as:
- `notification_dismissed_<notification_id>: boolean`

No migration needed - fields are added dynamically when first dismissed.

## Examples

### Feature Announcement

```typescript
{
  id: 'feature_care_guides_2024',
  type: 'feature_announcement',
  title: '✨ New: Care Guides',
  description: 'Create guides for babysitters and family.',
  icon: 'megaphone',
  gradient: 'from-blue-100 to-purple-100',
  dismissible: true,
  priority: 85,
  shouldShow: (c) =>
    c.hasChildren &&
    !c.dismissedNotifications.has('feature_care_guides_2024'),
  actions: [
    { label: 'Try It Now', href: '/care-guides', style: 'primary' },
  ],
}
```

### Milestone Celebration

```typescript
{
  id: 'milestone_50_moments',
  type: 'milestone',
  title: '🎉 50 Moments Captured!',
  description: "You're building an amazing family archive!",
  icon: 'check',
  gradient: 'from-green-100 to-teal-100',
  dismissible: true,
  priority: 75,
  shouldShow: (c) =>
    c.hasMoments &&
    !c.dismissedNotifications.has('milestone_50_moments'),
  actions: [
    { label: 'View All', href: '/timeline', style: 'primary' },
  ],
}
```

### Helpful Tip

```typescript
{
  id: 'tip_weekly_routine',
  type: 'tip',
  title: '💡 Tip: Make it a routine',
  description: 'Capture one moment each day to build a consistent record.',
  icon: 'lightbulb',
  gradient: 'from-amber-100 to-orange-100',
  dismissible: true,
  priority: 65,
  shouldShow: (c) =>
    c.accountAgeDays >= 14 &&
    c.hasMoments &&
    !c.dismissedNotifications.has('tip_weekly_routine'),
}
```

## Testing

1. Adjust `accountAgeDays` calculation in dashboard to test time-based notifications
2. Temporarily set `priority` very high to force your notification to show first
3. Use `!c.dismissedNotifications.has('your_id')` to ensure it appears
4. Test dismissal by clicking the X button

## Best Practices

1. ✅ Use clear, action-oriented titles
2. ✅ Keep descriptions under 2 lines
3. ✅ Include relevant actions when possible
4. ✅ Make dismissible unless critical to onboarding
5. ✅ Use appropriate icons for the message type
6. ✅ Test with different user states
7. ❌ Don't show too many notifications at once
8. ❌ Don't repeat dismissed notifications (check the set!)
