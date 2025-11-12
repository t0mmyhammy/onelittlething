# Implementation Status

## Current vs Vision Assessment

### ✅ Fully Implemented

#### Capture
- **Home/Dashboard** - Daily anchor, quick moment capture, progress tiles
- **Timeline** - Journal entries with filters, child tags, photos
- **Add Moment** - Text entry, photo attachment, multi-child tagging
- **Voice Input** - Speech-to-text moment capture

#### Organize - Care Guides
- **Child Care Info** - All sections implemented:
  - Routines (wake, naps, meals, bedtime, etc.)
  - Health (allergies, medications, conditions)
  - Comfort (calming tips, favorites, dislikes)
  - Safety (dos, donts, warnings, car seat)
  - Contacts (parents, pediatrician, emergency)
- **Family Care Info** - All sections implemented:
  - Home Base (address, wifi, door codes, parking)
  - House Rules (screens, snacks, pets, visitors, off-limits)
  - Schedule (school, activities, transportation, homework)
  - Emergency (plan, hospital, urgent care, insurance)
- **Field-level Privacy** - Eye-on/eye-off toggles per field
- **Autosave** - 1-second debounce with undo for 10 seconds
- **Tab Persistence** - Remembers active tab on reload

#### Organize - Sizes
- **Size Tracking** - Current and next sizes per category
- **Custom Categories** - User-defined size categories
- **Need Status** - Track which sizes are needed

#### Other
- **Pregnancy Tracking** - Week-by-week countdown with size comparisons
- **Child Management** - Add, edit, archive children
- **Photo Management** - Upload and display photos
- **Authentication** - Supabase Auth with Google OAuth
- **Multi-tenancy** - Family isolation with RLS

### 🚧 Partially Implemented

#### Organize - Sizes & Ideas
**Current state:**
- Has `child_sizes` table
- Has `shopping_list_items` table
- Has `inventory_items` table
- Current UI: Sizes/Needs/Wishlist tabs

**Vision state:**
- Sizes/Ideas/Wishlist tabs
- AI-powered Ideas generation
- Separate `ideas` and `wishlist_items` tables

**Gap:**
- Need to create `ideas` table
- Need to create `wishlist_items` table
- Need to build Ideas tab with AI mode
- Need to refactor shopping_list_items → wishlist_items

#### Share - Care Guides
**Current state:**
- ✅ Guide generation (markdown templates)
- ✅ Copy to clipboard
- ✅ Database tables exist (care_guides, guide_shares, guide_access_logs)

**Vision state:**
- Generate and copy guides ✅
- Create shareable links with tokens
- Passcode protection
- Expiration dates
- Access logs dashboard
- Revocation

**Gap:**
- Need to build Share Links UI
- Need API routes for share link CRUD
- Need public viewer page (/share/[token])
- Need access logs UI

### ❌ Not Implemented

#### Share & Support
- **Chat with Liv** - AI assistant with shortcuts
  - Need chat UI component
  - Need OpenAI integration with context
  - Need conversation persistence

#### Organize - Ideas
- **AI Ideas Mode** - Generate ideas from prompts
  - Need OpenAI integration
  - Need ideas generator with size context
  - Need "Add to Ideas" action from results
- **Manual Ideas Mode** - Manually add ideas
- **Ideas List** - View all ideas, filter by status

#### Organize - Wishlist
- **Wishlist Management** - Reserve, purchase, receive status
- **Share Wishlist** - Share link for family/friends to see
- **Gift Coordination** - Reserve items to avoid duplicates

---

## Database Schema Gaps

### Tables to Create

#### `ideas`
```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  size TEXT,
  brand TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'added_to_wishlist', 'purchased', 'dismissed')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('ai', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ideas_child ON ideas(child_id, created_at DESC);
CREATE INDEX idx_ideas_status ON ideas(status);
```

#### `wishlist_items`
```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  size TEXT,
  brand TEXT,
  url TEXT,
  price_cents INTEGER,
  color TEXT,
  notes TEXT,
  status TEXT DEFAULT 'needed' CHECK (status IN ('needed', 'reserved', 'purchased', 'received')),
  reserved_by TEXT,
  reserved_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  hide_from_sharing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wishlist_child ON wishlist_items(child_id, created_at DESC);
CREATE INDEX idx_wishlist_status ON wishlist_items(status);
```

#### `chat_sessions` (for Liv)
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT,
  style TEXT, -- parenting style if selected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id, created_at DESC);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at ASC);
```

**Note:** Check if chat persistence already exists from migration `20251107000004_chat_persistence.sql`

---

## API Routes to Create

### Ideas
- `POST /api/children/:id/ideas/generate` - Generate AI ideas
- `GET /api/children/:id/ideas` - List ideas
- `POST /api/children/:id/ideas` - Add manual idea
- `PATCH /api/children/:id/ideas/:ideaId` - Update idea (status, notes)
- `DELETE /api/children/:id/ideas/:ideaId` - Delete idea

### Wishlist
- `GET /api/children/:id/wishlist` - List wishlist items
- `POST /api/children/:id/wishlist` - Add wishlist item
- `PATCH /api/children/:id/wishlist/:itemId` - Update item (status, reserved_by)
- `DELETE /api/children/:id/wishlist/:itemId` - Delete item

### Share Links
- `POST /api/guides/generate` - Generate and save guide
- `GET /api/guides` - List saved guides
- `GET /api/guides/:id` - Get guide details
- `POST /api/shares` - Create share link
- `GET /api/shares` - List user's share links
- `GET /api/shares/:id` - Get share link details
- `PATCH /api/shares/:id/revoke` - Revoke share link
- `GET /api/shares/:id/logs` - Get access logs for share

### Public
- `GET /share/:token` - Public viewer for shared guides
- `POST /share/:token/access` - Log access and verify passcode

### Chat
- `POST /api/chat/sessions` - Create new chat session
- `GET /api/chat/sessions` - List user's sessions
- `POST /api/chat/sessions/:id/messages` - Send message, stream response
- `GET /api/chat/sessions/:id` - Get session with messages

---

## UI Components to Build

### Sizes & Ideas Page Refactor
- [x] Sizes Tab (exists)
- [ ] Ideas Tab with AI Mode / Manual Mode toggle
- [ ] AI Ideas prompt input and results grid
- [ ] Manual Ideas list with status filters
- [ ] Wishlist Tab (refactor from current Wishlist)

### Share Links Dashboard
- [ ] Active links list with metadata
- [ ] Create new link modal
- [ ] Link settings (expiry, passcode, sections)
- [ ] Copy link button
- [ ] Revoke confirmation
- [ ] Access logs viewer

### Public Share Viewer
- [ ] Token validation and passcode prompt
- [ ] Formatted guide display (read-only)
- [ ] Print-friendly styles
- [ ] Expired/revoked message

### Chat with Liv
- [ ] Chat interface component
- [ ] Message list with user/assistant bubbles
- [ ] Input with send button
- [ ] Streaming response animation
- [ ] Style selector (optional)
- [ ] Save/load conversations

---

## Priority Roadmap

### Sprint 1: Ideas & Wishlist
1. Create `ideas` and `wishlist_items` migrations
2. Build Ideas Tab with AI mode
3. Integrate OpenAI for idea generation
4. Refactor Wishlist from shopping_list_items
5. Test full Sizes/Ideas/Wishlist flow

### Sprint 2: Share Links
1. Build Share Links dashboard
2. Create API routes for share CRUD
3. Build public share viewer page
4. Add passcode and expiry logic
5. Build access logs UI
6. Test end-to-end sharing flow

### Sprint 3: Chat with Liv
1. Verify chat_sessions schema exists
2. Build chat UI component
3. Create streaming chat API
4. Add parenting style context
5. Integrate saved conversations
6. Test conversational flows

---

## Acceptance Criteria Tracking

| Criterion | Status |
|-----------|--------|
| Capture a moment from Home in two taps | ✅ Done |
| Open Ideas in AI mode, save two cards | ⏳ Not started |
| Create Babysitter Pack, preview, generate link | 🚧 Guide gen done, links not done |
| Revoke a link and see viewer notice | ⏳ Not started |
| Autosave with undo within 10 seconds | ✅ Done |

---

## Migration Plan

### Phase 1: Ideas & Wishlist Tables
Create migration `20251112000002_create_ideas_and_wishlist.sql`

### Phase 2: Chat Tables (if needed)
Check if chat persistence migration already has what we need

### Phase 3: Update RLS Policies
Ensure all new tables have proper RLS policies

### Phase 4: Data Migration (optional)
If needed, migrate `shopping_list_items` → `wishlist_items`
