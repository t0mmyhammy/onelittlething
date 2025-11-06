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

### 🚧 In Progress

#### Journal Entries
- Created `NewEntryModal` component
- Features:
  - Date selection
  - Multi-child tagging (select which kids the entry is about)
  - Text area for content
  - Saves to `entries` and `entry_children` tables
- **Next**: Wire up to dashboard "New Entry" button

### 📋 TODO - MVP Phase 1

1. **Wire up New Entry button** - Connect modal to dashboard
2. **Display entries on dashboard** - Show recent moments in timeline
3. **Entry editing/deletion** - Allow users to modify past entries

### 📋 TODO - MVP Phase 2 (Future)

1. **Timeline view** - Dedicated page with filters by child
2. **AI Chat integration** - OpenAI-powered parenting coach (Love & Logic style)
3. **AI Insights** - Analyze entries for patterns, milestones
4. **Photo/audio entries** - Expand beyond text
5. **Artifact generation** - Create books, letters, calendars from entries
6. **Re-engagement emails** - 3-day and 7-day reminders
7. **Notification system** - Daily nudges, snooze/away mode
8. **Child development tracking** - Milestones, growth charts
9. **Family member invites** - Allow partners to join and contribute

## Important Files & Locations

### Components
- `/components/AddChildModal.tsx` - Add new child
- `/components/EditChildModal.tsx` - Edit existing child with photo
- `/components/ChildrenSection.tsx` - Display children on dashboard
- `/components/ImageCropper.tsx` - Photo crop/zoom (300px circular)
- `/components/PhotoUpdateModal.tsx` - Camera/upload chooser
- `/components/NewEntryModal.tsx` - Create journal entries

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

---

**Last Updated**: 2025-11-06
**Version**: MVP Phase 1 (90% complete)
**Next Milestone**: Complete journal entry feature
