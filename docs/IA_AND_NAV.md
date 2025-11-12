# Information Architecture and Navigation

## Navigation Structure

Navigation is grouped by user intent and follows the Capture → Organize → Share model.

### Sidebar/Mobile Nav Groups

#### Capture
- **Home** - Daily anchor, quick add moment, progress tiles
- **Timeline** - Rolling journal of moments with filters

#### Organize
- **Sizes & Ideas** - Track sizes, get AI ideas, manage wishlist
- **Care Guides** - Build comprehensive care information

#### Share & Support
- **Share Links** - Manage active shared guides
- **Chat with Liv** - AI assistant for parenting help

#### Account
- **Settings** - Profile, family, children, preferences

## Universal Floating Plus Behavior

The floating **+** button adapts to context:

| Page | Plus Action |
|------|-------------|
| Home | Quick add moment |
| Timeline | Add moment with full form |
| Sizes & Ideas (Sizes tab) | Add size category |
| Sizes & Ideas (Ideas tab) | Open AI prompt |
| Sizes & Ideas (Wishlist tab) | Add wishlist item |
| Care Guides | Quick add to current section |
| Share Links | Create new share link |

## Page Structure

### Home
```
┌─────────────────────────────────┐
│ Daily Anchor                    │
│ ┌─────────────────────────────┐ │
│ │ "How's everyone today?"     │ │
│ │ [Quick sentiment picker]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Quick Add Moment                │
│ ┌─────────────────────────────┐ │
│ │ What moment do you want to  │ │
│ │ remember?                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Progress Tiles                  │
│ ┌──────────┐ ┌──────────┐     │
│ │ Care     │ │ Sizes    │     │
│ │ Guides   │ │ Updated  │     │
│ └──────────┘ └──────────┘     │
│                                 │
│ [Pregnancy Tile if relevant]    │
└─────────────────────────────────┘
```

### Sizes & Ideas
```
┌─────────────────────────────────┐
│ [Sizes] [Ideas] [Wishlist]      │
├─────────────────────────────────┤
│                                 │
│ [Tab Content]                   │
│                                 │
│ Ideas Tab:                      │
│ ┌─────────────────────────────┐ │
│ │ [AI Mode] [Manual Mode]     │ │
│ ├─────────────────────────────┤ │
│ │ AI Mode:                    │ │
│ │ "What are you looking for?" │ │
│ │ [Generate Ideas]            │ │
│ │                             │ │
│ │ Manual Mode:                │ │
│ │ [+ Add Idea Manually]       │ │
│ │ [Idea List]                 │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Care Guides
```
┌─────────────────────────────────┐
│ [Share Guide]                   │
├─────────────────────────────────┤
│ [Family] [Emma] [Leo]           │
├─────────────────────────────────┤
│                                 │
│ Child Tab:                      │
│ ┌─────────────────────────────┐ │
│ │ Routines     [eye icon]     │ │
│ │ Health       [eye-off]      │ │
│ │ Comfort      [eye icon]     │ │
│ │ Safety       [eye icon]     │ │
│ │ Contacts     [eye icon]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Section Details]               │
└─────────────────────────────────┘
```

### Share Links
```
┌─────────────────────────────────┐
│ Active Share Links              │
│ [+ Create New Link]             │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Babysitter Pack             │ │
│ │ Created: 2 days ago         │ │
│ │ Expires: in 5 days          │ │
│ │ Views: 3                    │ │
│ │ [Copy Link] [View] [Revoke] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ School Guide - Emma         │ │
│ │ Created: 1 week ago         │ │
│ │ Expires: never              │ │
│ │ Views: 12                   │ │
│ │ [Copy Link] [View] [Revoke] │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Tabs and Sub-navigation

### Tab Component Pattern
- Use `role="tablist"` on container
- Use `role="tab"` on buttons
- Use `aria-selected="true|false"`
- Arrow key navigation for keyboard users
- Animated underline or background for active tab

### Tab Persistence
- Store active tab in localStorage per page
- Restore on page load
- Validate saved tab still exists (child might be archived)

## Empty States

Every collection view has an empty state:

| View | Empty State |
|------|-------------|
| Timeline | "Your family's story starts here. Add your first moment!" |
| Ideas (Manual) | "Add ideas manually or try AI mode to get suggestions" |
| Wishlist | "Heart items from Ideas or add directly to build a wishlist" |
| Share Links | "Create your first share link to send care guides to others" |

## Mobile Navigation

- Bottom tab bar on mobile (< 768px)
- Sidebar on desktop (≥ 768px)
- Grouped by intent: Capture, Organize, Share, Account
- Active state with icon color change and label weight
