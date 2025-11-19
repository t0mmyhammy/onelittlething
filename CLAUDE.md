# Project Instructions for Claude Code

## Troubleshooting Methodology

When debugging, fixing bugs, or implementing features, ALWAYS follow the principles outlined in `firstprinciples.md`.

Key principles to follow:
- **STOP. THINK. UNDERSTAND. THEN ACT.**
- Understand the problem before writing any code
- Identify root causes, not symptoms
- Design complete solutions that consider all constraints
- Test thoroughly across all environments
- Avoid quick fixes that create technical debt

Refer to `firstprinciples.md` for the complete framework, including:
- The 6-step troubleshooting framework
- Common anti-patterns to avoid
- Decision-making guidelines
- Deployment checklist
- Questions to ask before every fix

## Project Context

**OneLittleThing** is a private parenting app that helps families capture moments, organize practical info, and share what caregivers need.

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v3 (custom sage/rose/cream theme)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (child-photos, profile-photos, entry-photos)
- **AI**: OpenAI GPT-4 with streaming
- **Hosting**: Vercel
- **Domain**: littlevictors.com

### Architecture Patterns
- Server Components by default
- Client Components only when needed (forms, modals, interactive UI)
- Edge runtime for API routes
- Row Level Security (RLS) on all tables
- Multi-tenancy via family_id
- Real-time updates via Supabase subscriptions (where needed)

### Key Features
1. **Capture**: Timeline, moments, photos, "On This Day"
2. **Organize**: Sizes, Reminders, Pack Lists, Ready for Baby, Care Guides
3. **Share & Support**: Generate care guides, AI coach

### Database Important Notes
- All features require user to be part of a family (family_id)
- Dashboard auto-creates family if user has none
- Always check for family_id and redirect to /dashboard if missing
- RLS policies enforce family isolation

### Recent Major Features Added
- **Weekly Highlights** (Nov 2025): AI-powered weekly timeline summary with reflection questions
- **Names Module Enhancements** (Nov 2025): Family Fit Spotlight, AI notes backfill, comparison table improvements
- **Reminders** (Nov 2025): Task management with family sharing
- **Pack Lists** (Nov 2025): Reusable checklists with templates
- **Ready for Baby** (Nov 2025): Pregnancy preparation hub
- **Pack List Templates**: Hospital bags, road trip, beach, camping

### Common Patterns
- Use createClient() from '@/lib/supabase/server' for server components
- Use createClient() from '@/lib/supabase/client' for client components
- Always include familyDueDate prop in MobileNav
- Use CATEGORY_CONFIG pattern for sections with icons/colors
- Modal components close on successful operations

### Known Issues
- Users without family_id will get UUID errors - redirect to dashboard
- babyPrepList can be null on first visit - handle gracefully
- RLS policies must allow INSERT for new users
- Weekly highlights API uses simplified `select('*')` query - entry_children relationship query needs fix (deferred)

Always verify assumptions and test changes in all relevant environments before deploying.
