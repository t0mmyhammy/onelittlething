# OneLittleThing

A parenting app designed to capture daily moments about your children. The core concept is to make it easy for parents to record "one little thing" each day about their kids, building a private timeline of memories.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run database migrations
# (See PROJECT_STATUS.md for migration instructions)

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel

## Key Features

- 📝 **Quick Entry Creation**: Optimized UX for capturing moments in under 10 seconds
- 👶 **Child Management**: Add multiple children with photos, birthdates, and custom label colors
- 📅 **On This Day**: See memories from the same date in previous years
- 🎨 **Soft Pastel Design**: Brand-aligned color palette with cream, sand, rose, and sage tones
- 🔒 **Secure & Private**: Row-level security, multi-tenancy support
- 🖼️ **Photo Support**: Profile photos for users and children with crop/zoom functionality

## Project Structure

```
/app                  # Next.js App Router pages
/components           # React components
/lib                  # Utilities (Supabase clients, helpers)
/supabase/migrations  # Database migrations
/public               # Static assets
```

## Documentation

For detailed documentation, see:
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Complete project overview, features, known issues, and development guide

## Recent Updates (2025-11-07)

- ✅ Added customizable label colors for children (soft pastel palette)
- ✅ Redesigned Edit Child modal with collapsible sections
- ✅ Implemented archive functionality for children with memories
- 🐛 Known issue: Label color persistence (logged for future fix)

## Environment Setup

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1. Create a Supabase project
2. Run all migrations in `/supabase/migrations/` in order
3. Create storage buckets: `child-photos` and `profile-photos`
4. Configure authentication providers (Email, Google OAuth)

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Status**: MVP Phase 1 - Core Complete ✅
**Last Updated**: 2025-11-07
