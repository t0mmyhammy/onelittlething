# OneLittleThing - Project Status

## Overview
OneLittleThing is a parenting app designed to capture daily moments about children. The core concept is to make it easy for parents to record "one little thing" each day about their kids, building a private timeline of memories.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS v3
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel (planned)
- **AI**: OpenAI API (planned for AI chat feature)

## Current Status: MVP Phase 1 - Core Features Complete ✅

### ✅ Completed Features

#### 1. Authentication & User Management
- Email/password authentication
- Google OAuth (Facebook removed per user request)
- User profile page with photo upload and display name
- Profile photos stored in `profile-photos` bucket
- Dashboard header shows user profile photo and name

#### 2. Family & Children Management
- Automatic family creation on signup
- Add/edit children with:
  - Name
  - Birthdate (optional, supports future dates for unborn children)
  - Gender selection (boy/girl, optional)
  - Profile photo with crop/zoom functionality
- Children display on dashboard with:
  - Profile photos
  - Age calculation
  - Due date display for unborn children
  - Gender-based background colors (blue/pink)
- Photo cropper component (300px circular crop, reusable for both children and user profiles)
- Photos stored in `child-photos` bucket

#### 3. Database Schema
Tables created and configured:
- `families` - Family groups
- `family_members` - Users belonging to families
- `children` - Child profiles
- `entries` - Journal entries
- `entry_children` - Many-to-many relationship between entries and children
- `user_preferences` - User settings (display_name, profile_photo_url, timezone, notifications)
- `parenting_styles` - AI chat personality styles
- `user_parenting_styles` - User's selected AI style

#### 4. Security
- Row Level Security (RLS) policies implemented on all tables
- Multi-tenancy support (families isolated from each other)
- Storage policies for photo uploads (user-specific folders)
- RPC functions for complex operations:
  - `create_family_with_member()` - Atomic family + member creation
  - `update_child()` - Update child with security checks
  - `is_family_member()` - Helper function for RLS policies

#### 5. Journal Entries
- Full journal entry system with optimized UX
- `NewEntryModal` component with:
  - Auto-focus on text field (sub-10-second entry creation)
  - Rotating placeholder text (10 inspiring examples)
  - Smart defaults: auto-fills today's date, defaults to all children
  - Progressive disclosure: collapsed date picker (shows "📅 Today" button)
  - Simplified child selection with tag display
  - Multi-child tagging support
  - Saves to `entries` and `entry_children` tables
- `EntriesSection` component displaying recent moments on dashboard
- Full integration with dashboard "New Entry" button

#### 6. "On This Day" Feature
- Nostalgic feature showing memories from same date in previous years
- Beautiful amber/rose gradient card design
- Queries entries matching current month-day across all years
- Shows "X years ago" for each memory
- Displays child tags and full entry content
- Limited to 3 entries for focused experience
- Positioned at top of dashboard for immediate emotional engagement

#### 7. Dashboard Layout
- Redesigned to "Lead with Memories, Not Admin"
- Order: Welcome → On This Day → Recent Moments → Your Children
- Welcome message includes user's display name
- Children section moved to bottom (admin function)
- Profile photo and name displayed in header

### 📋 TODO - MVP Phase 1

1. **Photo attachments to entries** - Allow users to attach photos to moments
2. **Entry editing/deletion** - Allow users to modify past entries
3. **Timeline view** - Dedicated page with filters by child

### 📋 TODO - MVP Phase 2 (Future)

1. **AI Chat integration** - OpenAI-powered parenting coach (Love & Logic style)
2. **AI Insights** - Analyze entries for patterns, milestones
3. **Voice notes with transcription** - Record moments hands-free
4. **Smart auto-tagging** - Auto-detect child names in entry text
5. **Artifact generation** - Create books, letters, calendars from entries
6. **Re-engagement emails** - 3-day and 7-day reminders
7. **Notification system** - Daily nudges (8pm), snooze/away mode
8. **Monthly recap** - Summary of captured moments
9. **Child development tracking** - Milestones, growth charts
10. **Family member invites** - Allow partners to join and contribute

## Important Files & Locations

### Components
- `/components/AddChildModal.tsx` - Add new child
- `/components/EditChildModal.tsx` - Edit existing child with photo
- `/components/ChildrenSection.tsx` - Display children on dashboard
- `/components/ImageCropper.tsx` - Photo crop/zoom (300px circular)
- `/components/PhotoUpdateModal.tsx` - Camera/upload chooser
- `/components/NewEntryModal.tsx` - Create journal entries (optimized UX)
- `/components/EntriesSection.tsx` - Display recent moments on dashboard
- `/components/OnThisDay.tsx` - Show memories from same date in previous years

### Pages
- `/app/page.tsx` - Landing page
- `/app/login/page.tsx` - Login
- `/app/signup/page.tsx` - Sign up
- `/app/dashboard/page.tsx` - Main dashboard (Server Component)
- `/app/profile/page.tsx` - User profile settings
- `/app/auth/callback/route.ts` - OAuth callback handler

### Database
- `/supabase/migrations/` - All SQL migrations
- Key migrations:
  - `20251106153021_initial_schema.sql` - Core tables
  - `20251106153144_rls_policies.sql` - Security policies
  - `20251106192000_fix_family_member_rls.sql` - Fixed RLS deadlock
  - `20251106193000_add_user_profile_fields.sql` - Profile photo/name fields

### Utilities
- `/lib/supabase/client.ts` - Client-side Supabase client
- `/lib/supabase/server.ts` - Server-side Supabase client
- `/lib/utils/age.ts` - Age calculation helper
- `/lib/utils/dateFormat.ts` - Human-readable date formatting

## Known Issues & Solutions

### Issue: "new row violates row-level security policy"
**Cause**: RLS policies blocking operations
**Solution**: Use RPC functions (`create_family_with_member`, `update_child`) which have `SECURITY DEFINER`

### Issue: Profile not updating/showing
**Cause**: Caching or missing user_preferences row
**Solution**:
- Added `export const dynamic = 'force-dynamic'` to dashboard
- Changed profile update from `update()` to `upsert()` to auto-create row

### Issue: Photo upload fails
**Cause**: Storage bucket doesn't exist or policies missing
**Solution**: Run storage bucket creation SQL and policies (in migrations)

### Issue: Family not created on signup
**Cause**: RLS policy chicken-and-egg problem
**Solution**: Updated family_members INSERT policy to allow `user_id = auth.uid()`

## Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (if needed)
OPENAI_API_KEY=your_openai_key (for future AI features)
RESEND_API_KEY=your_resend_key (for future email features)
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Database Setup Checklist

When setting up a new Supabase project:

1. ✅ Run all migrations in `/supabase/migrations/` in order
2. ✅ Create storage buckets:
   - `child-photos` (public)
   - `profile-photos` (public)
3. ✅ Set up storage policies (in migrations)
4. ✅ Configure Google OAuth:
   - Get Client ID/Secret from Google Cloud Console
   - Add to Supabase Auth providers
   - Set redirect URL: `https://[project].supabase.co/auth/v1/callback`
5. ✅ Enable Row Level Security on all tables

## Design System

### Brand Colors (Tailwind)
- `cream` (#F8F3EC) - Background
- `sand` (#E9DFD0) - Borders, subtle accents
- `rose` (#D8A7A0) - Primary actions, important buttons
- `sage` (#B6C1A9) - Secondary actions, success states
- `cornflower` (#AAB7C4) - Info, links
- `amber` (#FFD79D) - Highlights, tags

### Typography
- **Headings**: Playfair Display (serif) - `font-serif`
- **Body**: Inter (sans-serif) - `font-sans`

### UI Patterns
- Rounded corners: `rounded-lg` (8px) or `rounded-2xl` (16px)
- Shadows: `shadow-sm` for cards
- Buttons: Scale animation on hover (`hover:scale-[1.02]`)
- Gray when disabled, brand color when active
- Circular profile photos with border

## User Flow

1. **Sign Up** → Google OAuth or email/password
2. **Auto-create family** → User becomes "parent" role
3. **Dashboard** → See welcome message, add children
4. **Add Children** → Name, photo, birthdate, gender
5. **Create Entries** → Select child(ren), write moment, set date
6. **View Timeline** → See past moments, filter by child
7. **(Future) AI Chat** → Get parenting advice based on Love & Logic

## Testing Notes

- Test user: tom@example.com (or whatever email you used)
- Family ID visible in dashboard queries
- Check browser console for detailed error logs
- Use Supabase Studio to inspect data directly

## Troubleshooting Tips

1. **Always check browser console first** - Most errors show there
2. **Check Supabase logs** - Real-time logs in Supabase dashboard
3. **Verify RLS policies** - Use `SELECT * FROM pg_policies WHERE tablename = 'table_name'`
4. **Check storage policies** - Query `storage.objects` policies
5. **Clear Next.js cache** - Delete `.next` folder and restart dev server
6. **Hard refresh browser** - Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## Contact & Support

- GitHub Issues: [Create issue]
- Supabase Support: https://supabase.com/support
- Next.js Docs: https://nextjs.org/docs

## Recent Updates - 2025-11-07

### ✅ Completed Updates

#### 1. Label Color System (Soft Pastel Palette)
- Added customizable label colors for children
- 6 soft pastel color options: mint green, butter yellow, sky blue, blush pink, peach orange, lavender purple
- Colors appear on:
  - Child cards in Family tab
  - Child name labels on entries (dashboard, timeline, "On This Day")
  - Color picker in Edit Child modal
- Uses inline styles with hex colors for reliable rendering
- Database: Added `label_color` column to `children` table (default: 'yellow')

#### 2. Edit Child Modal Redesign
- **New Layout**: Photo section moved to top of form
- **Collapsible Sections**: Name, birthdate, and gender fields now show values with edit icons
  - Click pencil icon to edit each field individually
  - Cleaner, more focused UI
- **Dynamic Title**: Modal title shows "Edit [Child's Name]" instead of generic "Edit Child"
- **Improved Color Picker**: Full color backgrounds with visible selection states

#### 3. Archive Functionality
- Added `archived` column to `children` table
- Archive option appears in Edit Child modal when child has associated memories
- Archived children hidden from normal views but memories preserved
- Delete option still available (shows Archive + Delete when child has entries)
- Database migration: `20251107000002_add_archived_to_children.sql`

#### 4. Database Migrations Created
- `20251107000000_add_label_color_to_children.sql` - Adds label_color column
- `20251107000001_update_child_function_label_color.sql` - Updates RPC function to handle label colors
- `20251107000002_add_archived_to_children.sql` - Adds archived column for soft deletes

### 🐛 Known Issues

#### Label Color Persistence Bug
**Status**: Logged for future fix
**Symptoms**:
- Color updates may not immediately reflect on child cards
- Color selection doesn't always persist after modal close
**Attempted Fixes**:
- Updated RPC function to accept `child_label_color` parameter
- Fixed query filters for archived children
- Added console logging for debugging
- Implemented optimistic UI updates
**Next Steps**: Requires deeper investigation of refresh cycle and state management

### 📋 Updated File Locations

#### New Files
- `/lib/labelColors.ts` - Color palette definitions (hex values, Tailwind classes)

#### Modified Files
- `/components/EditChildModal.tsx` - Redesigned with collapsible sections, archive support
- `/components/ChildrenSection.tsx` - Uses inline styles for label colors
- `/components/EntriesSection.tsx` - Dynamic label colors for child tags
- `/components/TimelineView.tsx` - Dynamic label colors for child tags
- `/components/OnThisDay.tsx` - Dynamic label colors for child tags
- `/app/dashboard/page.tsx` - Updated children query to fetch label_color and archived
- `/app/timeline/page.tsx` - Updated children query
- `/app/settings/page.tsx` - Updated children query

---

## Recent Updates - 2025-11-09

### ✅ Major Feature Additions

#### 1. Tabbed Sizes & Needs Interface (Complete Redesign)
**New Components:**
- `ChildProfileBar` - Persistent left sidebar showing all children with photos and ages
- `SizesTab` - Editable size grid for tracking current/next sizes
- `NeedsTab` - Smart inventory management with Need/Have/Hide toggles
- `WishlistTab` - Gift management with Select/Buy/Reserve actions

**Features:**
- **Sizes Tab**:
  - Editable size cards (Shoes, Pants, Shirts)
  - Inline editing with save/cancel
  - Current & Next size tracking
  - Fit notes field
  - Last updated timestamps
  - Smart reminder system (90-day prompts)

- **Needs Tab**:
  - Accordion-style category grouping
  - Need/Have/Hide segmented toggle buttons
  - Auto-populated size chips from Sizes tab
  - Filter bar: Show All, Only Needs, Next Size Up, Hidden
  - Smart sorting (Need items float to top)
  - Category headers show current/next sizes

- **Wishlist Tab**:
  - Card-based layout with thumbnails
  - Select (star), Buy, Reserve action buttons
  - Inline reserve name input
  - Status badges (Selected, Reserved by X, Purchased)
  - Filter tabs: Active, Reserved, Purchased
  - Auto-sorting by status

**Technical:**
- Installed `lucide-react` for clean iconography (replaced all emojis)
- Responsive layout (desktop side-by-side, mobile stacks)
- All data persists to Supabase (`child_sizes`, `inventory_items`, `shopping_list_items`)

#### 2. Enhanced Timeline View
**Improvements:**
- Entries grouped by date with vertical timeline line
- Timeline nodes centered on the line (not beside it)
- Multiple entries on same day appear side-by-side (desktop) or stacked (mobile)
- Gradient timeline line (sage color fading to transparent)
- Shorthand dates (e.g., "Nov 9") on left side
- Responsive card width for multi-entry days

#### 3. AI Parenting Coach - "Liv"
**New Feature: `/advice` page**
- OpenAI-powered conversational parenting coach
- Parenting style selection:
  - Taking Cara Babies (sleep training)
  - Love and Logic (discipline through choices)
  - Positive Discipline (encouragement-based)
  - Gentle/Respectful (RIE approach)
  - Montessori-Informed (independence-focused)
- Custom style creation and editing
- Conversation persistence with history
- Child context awareness (ages, names)
- Brief, digestible responses (4-6 sentences)

**Components Added:**
- `AIChat` - Main chat interface with style selector
- `ParentingStyleSelector` - Style picker with descriptions
- `CustomStyleModal` - Create/edit custom approaches
- `SavedAdviceList` - Conversation history
- `AdvicePageClient` - Client wrapper

**Database:**
- `parenting_styles` table - Style definitions
- `user_parenting_styles` table - User's custom styles
- `chat_conversations` table - Conversation metadata
- `chat_messages` table - Message history

#### 4. Baby Countdown Card
**New Component: `BabyCountdownCard`**
- Shows pregnancy progress for unborn children (future birthdates)
- Week-by-week size comparisons (e.g., "Size of a mango")
- Circular progress ring (% to term / % to due date)
- Toggle between "% to term" (37 weeks) and "% to due" (40 weeks)
- Cycle button to show alternative size comparisons
- Days/weeks countdown to term and due date
- Uses Luxon for accurate date calculations

**Technical:**
- `/lib/pregnancy.ts` - Pregnancy calculation utilities
- `/lib/babySizes.ts` - Week-by-week size comparison data
- Installed `luxon` for timezone-aware date handling

#### 5. Database Migrations
**New migrations:**
- `20251107000003_parenting_styles.sql` - AI chat styles tables
- `20251107000004_chat_persistence.sql` - Conversation storage
- `20251107000005_sizes_and_needs.sql` - Size tracking tables
- `20251107000006_enhance_shopping_items.sql` - Shopping list enhancements
- `20251107000007_inventory_system.sql` - Inventory management
- `20251107000008_wishlist_status_system.sql` - Wishlist statuses
- `20251107000009_add_due_date_to_families.sql` - Family due dates

#### 6. TypeScript Improvements
**Fixed:**
- Type errors in chat API routes (`ParentingStyle` vs `CustomParentingStyle`)
- Proper type narrowing in `buildStylePrompt` function
- Added proper imports and type definitions

### 📋 New File Locations

#### New Pages
- `/app/advice/page.tsx` - AI parenting coach page
- `/app/sizes/page.tsx` - Sizes & Needs tabbed interface

#### New API Routes
- `/app/api/chat/route.ts` - OpenAI streaming chat
- `/app/api/chat/conversations/route.ts` - Conversation CRUD
- `/app/api/chat/messages/route.ts` - Message history
- `/app/api/chat/save/route.ts` - Save conversation
- `/app/api/chat/saved/route.ts` - Get saved conversations
- `/app/api/fetch-title/route.ts` - Fetch webpage titles

#### New Components
- `/components/ChildProfileBar.tsx` - Child selector sidebar
- `/components/tabs/SizesTab.tsx` - Sizes management
- `/components/tabs/NeedsTab.tsx` - Needs/inventory management
- `/components/tabs/WishlistTab.tsx` - Wishlist management
- `/components/BabyCountdownCard.tsx` - Pregnancy tracker
- `/components/AIChat.tsx` - Chat interface
- `/components/AdvicePageClient.tsx` - Advice page wrapper
- `/components/ParentingStyleSelector.tsx` - Style picker
- `/components/CustomStyleModal.tsx` - Custom style editor
- `/components/SavedAdviceList.tsx` - Conversation history

#### New Libraries
- `/lib/pregnancy.ts` - Pregnancy calculations
- `/lib/babySizes.ts` - Size comparison data
- `/lib/parentingStyles.ts` - Parenting style definitions

#### Modified Components
- `/components/EntriesSection.tsx` - Enhanced timeline layout
- `/app/dashboard/page.tsx` - Added BabyCountdownCard
- Navigation tabs updated across all pages

### 📦 Dependencies Added
- `lucide-react` - Icon library (replaced emojis)
- `openai` - OpenAI API client
- `ai` - Vercel AI SDK for streaming
- `luxon` - Date/time library
- `@types/luxon` - TypeScript types for Luxon

---

**Last Updated**: 2025-11-09
**Version**: MVP Phase 1.5 - Advanced Features Complete ✅
**Completion**: ~98% (all major features functional)
**Next Milestone**: Photo attachments to entries, export functionality
