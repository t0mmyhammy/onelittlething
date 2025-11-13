# Database Migrations

This document describes all database migrations in chronological order.

## Migration Files

Located in `supabase/migrations/`

---

## Recent Migrations (v1.8)

### 20251113000006_add_baby_prep_tables.sql
**Feature:** Ready for Baby

**Tables Created:**
- `baby_prep_lists` - Main pregnancy preparation list per family
  - `id` (uuid, primary key)
  - `family_id` (uuid, references families)
  - `due_date` (date, nullable)
  - `stage` ('first', 'second', 'third', 'fourth', nullable)
  - `is_second_child` (boolean, default false)
  - `created_at`, `updated_at`

- `baby_prep_tasks` - Checklist tasks organized by category
  - `id` (uuid, primary key)
  - `list_id` (uuid, references baby_prep_lists)
  - `category` ('essentials', 'family_home', 'money_admin', 'emotional_community', 'name_ideas')
  - `title` (text)
  - `description` (text, nullable)
  - `is_complete` (boolean, default false)
  - `completed_by` (uuid, references auth.users, nullable)
  - `completed_at` (timestamp, nullable)
  - `order_index` (integer)
  - `created_at`, `updated_at`

- `baby_name_ideas` - Name brainstorming with AI enhancement
  - `id` (uuid, primary key)
  - `family_id` (uuid, references families)
  - `name` (text)
  - `type` ('F', 'M', 'N') - Female, Male, Neutral
  - `notes` (text, nullable) - User notes
  - `ai_enhanced_notes` (jsonb, nullable) - AI-generated info (meaning, origin, popularity, sibling compatibility)
  - `reactions` (jsonb, default '{}') - Family member reactions by user_id
  - `created_by` (uuid, references auth.users, nullable)
  - `created_at`, `updated_at`

- `baby_name_comments` - Collaborative comments on names
  - `id` (uuid, primary key)
  - `name_id` (uuid, references baby_name_ideas)
  - `user_id` (uuid, references auth.users, nullable)
  - `comment_text` (text)
  - `created_at`

**RLS Policies:**
- All tables have SELECT/INSERT/UPDATE/DELETE policies based on family membership
- Users can only access data for their own family

**Indexes:**
- `baby_prep_lists.family_id`
- `baby_prep_tasks.list_id`
- `baby_name_ideas.family_id`
- `baby_name_comments.name_id`

---

### 20251113000005_add_reminders_table.sql
**Feature:** Reminders

**Tables Created:**
- `reminders` - Task management with family sharing
  - `id` (uuid, primary key)
  - `family_id` (uuid, references families)
  - `title` (text)
  - `description` (text, nullable)
  - `due_date` (date, nullable)
  - `priority` ('low', 'medium', 'high', default 'medium')
  - `is_complete` (boolean, default false)
  - `completed_at` (timestamp, nullable)
  - `completed_by` (uuid, references auth.users, nullable)
  - `created_by` (uuid, references auth.users)
  - `shared_with` (jsonb, default '[]') - Array of user_ids or "everyone"
  - `created_at`, `updated_at`

**RLS Policies:**
- Users can view reminders they created or that are shared with them
- Users can update/delete reminders they created
- Family members can view reminders shared with "everyone"

**Indexes:**
- `reminders.family_id`
- `reminders.due_date`
- `reminders.created_by`

**Features:**
- Smart sharing: share with specific users or entire family
- Priority levels for task urgency
- Due date tracking with overdue detection
- Completion tracking with timestamp and user

---

### 20251113000004_create_pack_lists.sql
**Feature:** Pack Lists

**Tables Created:**
- `pack_lists` - Reusable packing checklists
  - `id` (uuid, primary key)
  - `family_id` (uuid, references families)
  - `name` (text)
  - `duration_days` (integer, nullable) - Trip length
  - `created_by_user_id` (uuid, references auth.users)
  - `created_at`, `updated_at`
  - `last_used_at` (timestamp, default now())
  - `is_archived` (boolean, default false)

- `pack_list_categories` - Category sections within lists
  - `id` (uuid, primary key)
  - `pack_list_id` (uuid, references pack_lists)
  - `title` (text) - e.g., "Clothing", "Toiletries"
  - `order_index` (integer) - Display order
  - `created_at`, `updated_at`

- `pack_list_items` - Individual items to pack
  - `id` (uuid, primary key)
  - `category_id` (uuid, references pack_list_categories)
  - `label` (text) - Item name
  - `quantity` (integer, nullable) - How many to pack
  - `is_complete` (boolean, default false) - Packed status
  - `completed_by_user_id` (uuid, references auth.users, nullable)
  - `completed_at` (timestamp, nullable)
  - `order_index` (integer)
  - `created_at`, `updated_at`

**RLS Policies:**
- All tables have SELECT/INSERT/UPDATE/DELETE based on family membership
- Users can only access pack lists for their own family

**Indexes:**
- `pack_lists.family_id`
- `pack_lists.last_used_at`
- `pack_list_categories.pack_list_id`
- `pack_list_items.category_id`

**Features:**
- Archive/unarchive lists (soft delete)
- Last used tracking for sorting
- Duration tracking for trip planning
- Multi-user collaboration (family can pack together)

---

## Common Patterns

### RLS (Row Level Security)
All tables use RLS policies to ensure multi-tenancy and data isolation:
```sql
-- Example SELECT policy
CREATE POLICY "Users can view their family's data"
ON table_name FOR SELECT
TO authenticated
USING (
  family_id IN (
    SELECT family_id FROM family_members WHERE user_id = auth.uid()
  )
);
```

### Timestamps
Most tables include:
- `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
- `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`

### UUID Primary Keys
All tables use UUID primary keys generated with `gen_random_uuid()`

### Foreign Key Cascades
- Most foreign keys use `ON DELETE CASCADE` to clean up related records
- Some use `ON DELETE SET NULL` for audit trail (e.g., `completed_by_user_id`)

---

## Migration Best Practices

1. **Always test locally first** using `npx supabase db push` or `npx supabase db reset`
2. **Include RLS policies** in the same migration that creates the table
3. **Add indexes** for foreign keys and frequently queried columns
4. **Use transactions** for multi-step migrations
5. **Document breaking changes** in this file
6. **Version migrations** with timestamp prefix (YYYYMMDDHHMMSS)

---

## Applying Migrations

### Using Supabase CLI
```bash
# Push all pending migrations
npx supabase db push

# Reset database (WARNING: destroys all data)
npx supabase db reset
```

### Manual Application
1. Go to Supabase Dashboard → SQL Editor
2. Copy migration SQL
3. Execute query
4. Verify tables and policies created

---

## Troubleshooting

### "relation already exists"
- Migration was already applied
- Check `supabase_migrations` table
- Skip to next migration

### "permission denied for table"
- RLS policy issue
- Check policy USING clauses
- Verify family_members query works

### "invalid input syntax for type uuid"
- Empty string passed as UUID
- Check for `familyId || ''` patterns
- Ensure user has valid family_id

---

**Last Updated:** November 13, 2025
