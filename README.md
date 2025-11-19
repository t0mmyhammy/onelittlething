# OneLittleThing

**Help parents capture small moments, organize practical info, and share what caregivers need with confidence.**

Calm, human, private by default.

![Version](https://img.shields.io/badge/version-1.9-sage)
![Status](https://img.shields.io/badge/status-Active%20Development-success)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)

---

## What is OneLittleThing?

A private parenting app organized around three simple intents:

1. **Capture** - Record daily moments, photos, and memories
2. **Organize** - Track sizes, get AI ideas, build care guides
3. **Share** - Generate guides for babysitters, teachers, family

Unlike social parenting apps, OneLittleThing keeps everything private, calm, and focused on what matters to you.

---

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key (for AI features)

### Installation

```bash
# Clone and install
git clone https://github.com/trustedcareers/onelittlething.git
cd onelittlething
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys
```

### Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-...

# Email (optional)
RESEND_API_KEY=re_...
```

### Database Setup

```bash
# Apply migrations (if using Supabase CLI)
npx supabase db push

# Or manually apply migrations from supabase/migrations/ in order
```

### Storage Buckets

Create these public buckets in Supabase Storage:
- `child-photos`
- `profile-photos`
- `entry-photos`

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Core Features

### Capture
- **Home** - Daily anchor with quick moment capture
- **Timeline** - Rolling journal with filters by child and type
- **Weekly Highlights** - AI-powered summary of the week's moments with reflection questions
  - Per-child highlight sections
  - Combined family summary
  - Copy to clipboard functionality
- **Voice Input** - Hands-free moment recording
- **Photos** - Attach images to memories
- **On This Day** - See past memories from this date

### Organize
- **Sizes** - Track current and next sizes for clothing, shoes, etc.
- **Ideas** - AI-powered suggestions for things to buy
- **Wishlist** - Gift management with reserve/purchase status
- **Reminders** - Task management with smart sharing to family members
- **Pack Lists** - Reusable checklists for trips with template library
  - Hospital bags (auto-generated based on family context)
  - Road trip, beach vacation, camping templates
  - Import from text, AI generation, manual creation
- **Ready for Baby** - Comprehensive pregnancy preparation hub (shows when due date is near)
  - The Essentials, Family & Home, Money & Admin, Emotional & Community
  - Name Ideas with AI enhancement and family reactions
  - Context-aware recommendations (first baby vs. second+)
  - Auto-generate hospital bag pack lists
- **Names Module** - Baby naming with AI research and family context
  - Family Fit Spotlight: drag names to see full family preview
  - AI-powered name enhancement (meaning, origin, popularity, vibe)
  - Name comparison table with detailed research
  - Parent names editor for family context
  - Automatic AI notes backfill for enhanced names
- **Care Guides** - Build comprehensive info for child and family
  - Routines, Health, Comfort, Safety, Contacts
  - Family: Home Base, House Rules, Schedule, Emergency

### Share & Support
- **Share Guides** - Generate and copy formatted care guides
- **Share Links** (planned) - Create expiring links with passcode protection
- **Chat with Liv** (planned) - AI parenting assistant
- **Access Logs** (planned) - See who viewed shared guides

### Account
- **Profile** - Display name, photo, preferences
- **Family** - Manage children, invitations
- **Pregnancy Tracker** - Week-by-week countdown when expecting

---

## Development

### Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # Type-check without build
```

### Project Structure

```
onelittlething/
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Home page (capture)
│   ├── timeline/            # Journal timeline
│   ├── names/               # Baby naming with AI research
│   ├── sizes/               # Sizes & Ideas & Wishlist
│   ├── reminders/           # Task management
│   ├── pack-lists/          # Reusable checklists
│   ├── ready-for-baby/      # Pregnancy preparation hub
│   ├── care-info/           # Care guides
│   ├── advice/              # AI parenting coach
│   ├── settings/            # Account & family settings
│   └── api/                 # API routes
│       ├── enhance-baby-name/           # AI name enhancement
│       ├── generate-weekly-highlights/  # AI weekly timeline summary
│       ├── generate-hospital-bags/      # Template pack list generation
│       ├── generate-pack-list/          # AI pack list generation
│       ├── import-reminders/            # Import reminders from text
│       └── ...                          # Other API endpoints
├── components/              # React components
│   ├── care-info/          # Care guide sections
│   ├── tabs/               # Tab components
│   ├── timeline/           # Timeline components
│   ├── WeeklyHighlights.tsx         # Weekly highlights modal
│   ├── FamilyFitSpotlight.tsx       # Name family fit preview
│   ├── PackListTemplatesModal.tsx   # Pack list templates
│   ├── RecommendedTasksModal.tsx    # Baby prep recommendations
│   ├── ReminderCard.tsx             # Reminder display
│   └── ...                          # Shared components
├── lib/                     # Utilities and helpers
│   ├── supabase/           # Supabase clients
│   ├── guideGenerator.ts   # Guide template system
│   ├── pregnancy.ts        # Pregnancy calculations
│   ├── parentingStyles.ts  # AI style definitions
│   ├── baby-prep-templates.ts      # Ready for Baby task templates
│   └── hospital-bag-templates.ts   # Pack list templates
├── supabase/
│   └── migrations/         # Database migrations
│       ├── 20251113000004_create_pack_lists.sql
│       ├── 20251113000005_add_reminders_table.sql
│       ├── 20251113000006_add_baby_prep_tables.sql
│       └── ...
├── docs/                    # Product documentation
│   ├── PRODUCT_OVERVIEW.md
│   ├── DATA_MODEL.md
│   ├── IA_AND_NAV.md
│   ├── UX_GUIDELINES.md
│   └── API_SURFACE.md
└── public/                  # Static assets
```

### Feature Flags

To enable experimental features, add to `.env.local`:

```env
NEXT_PUBLIC_ENABLE_PREGNANCY_TILE=true
NEXT_PUBLIC_ENABLE_AI_IDEAS=true
NEXT_PUBLIC_ENABLE_SHARE_LINKS=false
```

---

## Documentation

- **[PRODUCT_OVERVIEW.md](./docs/PRODUCT_OVERVIEW.md)** - Vision, IA, core journeys, acceptance checks
- **[DATA_MODEL.md](./docs/DATA_MODEL.md)** - Database schema, redaction model, versioning
- **[IA_AND_NAV.md](./docs/IA_AND_NAV.md)** - Navigation, tabs, empty states, mobile patterns
- **[UX_GUIDELINES.md](./docs/UX_GUIDELINES.md)** - Design system, components, motion, copy patterns
- **[API_SURFACE.md](./docs/API_SURFACE.md)** - Endpoints, payloads, errors, rate limits
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions
- **[firstprinciples.md](./firstprinciples.md)** - Troubleshooting methodology

---

## Design System

### Colors
```
Sage:   #8B9D83  - Primary actions, active states
Rose:   #D4A5A5  - Child-focused features, highlights
Sand:   #F5E6D3  - Borders, subtle backgrounds
Cream:  #FBF7F0  - Page background
Amber:  #F59E0B  - Warnings, incomplete states
```

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Spacing Scale
```
4px (xs), 8px (sm), 12px (base), 16px (md), 24px (lg), 32px (xl), 48px (2xl)
```

### Border Radius
```
8px (small), 12px (base), 16px (large), 24px (xl)
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v3
- **Database**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **AI**: OpenAI GPT-4 with streaming responses
- **Icons**: Lucide React
- **Hosting**: Vercel
- **Domain**: littlevictors.com

---

## Security

- **Row Level Security (RLS)**: All tables protected with Supabase RLS policies
- **Multi-tenancy**: Family isolation with secure data access
- **Authentication**: Supabase Auth with Google OAuth
- **Storage policies**: User-specific folder permissions
- **Field-level privacy**: Eye-on/eye-off toggles for sensitive data
- **Share link security**: Optional passcode, expiry, revocation

---

## Roadmap

### Recently Completed ✅
- [x] Care guide generation (markdown templates)
- [x] Share guide copy-to-clipboard
- [x] Reminders with family sharing
- [x] Pack Lists with templates (hospital bags, travel)
- [x] Ready for Baby pregnancy preparation hub
- [x] AI name enhancement with family reactions
- [x] Context-aware recommendations (first vs. second+ baby)
- [x] Auto-generate hospital bag pack lists
- [x] Weekly Highlights with AI summary and reflection questions
- [x] Family Fit Spotlight for name preview
- [x] Pregnancy term modal improvements
- [x] Name comparison table text wrapping fixes
- [x] AI notes backfill for enhanced names

### Current Sprint
- [ ] Fix entry_children relationship query in weekly highlights
- [ ] Add more pack list templates
- [ ] Improve reminder sharing flow
- [ ] Polish Names module UX

### Next Up
- [ ] Share links with tokens and expiry
- [ ] Access logs and revocation
- [ ] Ideas tab with AI mode
- [ ] Wishlist functionality
- [ ] Chat with Liv (AI assistant)
- [ ] Email notifications
- [ ] Monthly recap summaries
- [ ] Family member invitations
- [ ] Export to PDF

### Future
- [ ] Mobile native app
- [ ] Offline support
- [ ] Advanced AI insights
- [ ] Milestone tracking
- [ ] Growth charts

---

## Acceptance Tests

✅ I can capture a moment from Home in two taps and see it in Timeline
⏳ I can open Ideas in AI mode, save two cards, and see them in my list
✅ I can create a Babysitter Pack and copy it to clipboard
⏳ I can generate a passcode link that expires and revoke it later
✅ Autosave works on every form section and I can undo within 10 seconds

---

## Contributing

This is a private project. For questions or feedback, contact the maintainer.

---

## License

Private project - All rights reserved

---

## Authors

**Tom Hamilton** - Project Lead

Built with ❤️ by parents, for parents.

---

**Last Updated**: November 17, 2025
**Version**: 1.9 - Names Module & Weekly Highlights
