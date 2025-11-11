# OneLittleThing - Family Parenting Journal

A beautiful, private parenting app designed to capture daily moments about your children. Record "one little thing" each day to build a meaningful timeline of memories.

![Version](https://img.shields.io/badge/version-1.6-sage)
![Status](https://img.shields.io/badge/status-MVP%20Complete-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)

## ✨ Features

### 📝 Core Journaling
- **Quick Entry**: Sub-10-second moment capture with smart defaults
- **Multi-child tagging**: Tag moments with one or multiple children
- **Timeline view**: Beautiful vertical timeline with grouped entries
- **On This Day**: Nostalgic feature showing memories from past years
- **Photo attachments**: Add photos to your moments
- **Voice capture**: Record moments hands-free with speech-to-text

### 👶 Family Management
- **Child profiles**: Names, photos, birthdates, custom label colors
- **Pregnancy tracker**: Week-by-week countdown with size comparisons
- **Archive functionality**: Soft-delete children while preserving memories

### 📊 Progress Tracking
- **Weekly streak widget**: Encouraging messages and visual progress
- **This Week's Progress**: Personalized messages based on daily capture count
- **Daily Anchor**: Inspirational quotes and personal mantras

### 🎁 Sizes & Needs Management
- **Sizes tracking**: Current and next sizes for clothing, shoes, etc.
- **Smart inventory**: Need/Have/Hide toggles for organized tracking
- **Wishlist**: Gift management with share functionality
- **Privacy controls**: Hide specific items from sharing

### 🤖 AI Parenting Coach - "Liv"
- **Conversational advice**: OpenAI-powered parenting coach
- **Custom styles**: Taking Cara Babies, Love & Logic, Positive Discipline, and more
- **Conversation history**: Save and revisit past advice
- **Child context-aware**: Provides age-appropriate guidance

### 🎨 Design & UX
- **Micro-animations**: Staggered card loading, pulse effects, subtle bounces
- **Mobile-first**: Hamburger navigation on all devices
- **Soft pastel palette**: Calm, warm colors (cream, sage, rose, cornflower)
- **Serif headings**: Playfair Display for warmth and personality

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v3
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **AI**: OpenAI GPT-4 with streaming responses
- **Icons**: Lucide React, Heroicons
- **Hosting**: Vercel
- **Domain**: littlevictors.com

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (for AI features)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/onelittlething.git
   cd onelittlething
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   ```

4. **Run database migrations**

   Apply all migrations in `/supabase/migrations/` in order to your Supabase project.

5. **Create storage buckets**
   - `child-photos` (public)
   - `profile-photos` (public)
   - `entry-photos` (public)

6. **Start development server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`

## 🗂️ Project Structure

```
onelittlething/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── timeline/          # Timeline view
│   ├── sizes/             # Sizes & Needs management
│   ├── advice/            # AI parenting coach
│   ├── settings/          # User settings
│   └── api/               # API routes
├── components/            # React components
│   ├── tabs/              # Tab components (Sizes, Needs, Wishlist, Ideas)
│   └── ...                # Shared components
├── lib/                   # Utilities and helpers
│   ├── supabase/          # Supabase clients
│   ├── utils/             # Helper functions
│   ├── pregnancy.ts       # Pregnancy calculations
│   └── parentingStyles.ts # AI style definitions
├── supabase/
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

## 🔐 Security

- **Row Level Security (RLS)**: All tables protected with RLS policies
- **Multi-tenancy**: Family isolation with secure data access
- **Authentication**: Supabase Auth with Google OAuth support
- **Storage policies**: User-specific folder permissions

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Safari (iOS & macOS)
- ✅ Firefox (latest)
- ✅ Mobile responsive (iOS & Android)

## 🎨 Design System

### Colors
- **Cream** (#F8F3EC) - Background
- **Sand** (#E9DFD0) - Borders
- **Rose** (#D8A7A0) - Primary actions
- **Sage** (#B6C1A9) - Secondary actions
- **Cornflower** (#AAB7C4) - Info states
- **Amber** (#FFD79D) - Highlights

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

## 🚦 Development

### Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

### Database Migrations
New migrations should be added to `/supabase/migrations/` with format:
```
YYYYMMDDHHMMSS_description.sql
```

## 📄 Documentation

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Detailed project status and feature list
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions
- **[firstprinciples.md](./firstprinciples.md)** - Troubleshooting methodology

## 🐛 Known Issues

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current known issues and solutions.

## 🗺️ Roadmap

### MVP Phase 2
- [ ] Export functionality (PDF books, calendars)
- [ ] Email notifications and reminders
- [ ] Monthly recap summaries
- [ ] Family member invitations
- [ ] Voice note transcription
- [ ] Smart auto-tagging

### Future
- [ ] Mobile native app (React Native)
- [ ] Offline support
- [ ] Advanced AI insights
- [ ] Milestone tracking
- [ ] Growth charts

## 📝 License

Private project - All rights reserved

## 👥 Authors

- Tom Hamilton - Project Lead

## 🙏 Acknowledgments

- Built with Next.js, React, and Supabase
- Icons from Lucide and Heroicons
- AI powered by OpenAI
- Inspired by parents everywhere capturing precious moments

---

**Last Updated**: November 11, 2025
**Version**: 1.6 - UX Polish Complete ✅
