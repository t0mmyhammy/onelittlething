# Data Model

## Overview

Keep redaction flags per field inside content JSON, and store a computed `share_view` that respects redactions.

## Tables

### child_care_info
Child-specific care information with field-level privacy controls.

```sql
CREATE TABLE child_care_info (
  id UUID PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES children(id),

  -- Sections (JSONB with field-level data)
  routines JSONB,
  routines_notes TEXT,
  routines_redacted_fields TEXT[],
  routines_updated_at TIMESTAMPTZ,

  health JSONB,
  health_notes TEXT,
  health_redacted_fields TEXT[],
  health_updated_at TIMESTAMPTZ,

  comfort JSONB,
  comfort_notes TEXT,
  comfort_redacted_fields TEXT[],
  comfort_updated_at TIMESTAMPTZ,

  safety JSONB,
  safety_notes TEXT,
  safety_redacted_fields TEXT[],
  safety_updated_at TIMESTAMPTZ,

  contacts JSONB,
  contacts_notes TEXT,
  contacts_redacted_fields TEXT[],
  contacts_updated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### family_care_info
Family-wide care information shared across all children.

```sql
CREATE TABLE family_care_info (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id),

  -- Sections (JSONB with field-level data)
  home_base JSONB,
  home_base_notes TEXT,
  home_base_redacted_fields TEXT[],
  home_base_updated_at TIMESTAMPTZ,

  house_rules JSONB,
  house_rules_notes TEXT,
  house_rules_redacted_fields TEXT[],
  house_rules_updated_at TIMESTAMPTZ,

  schedule JSONB,
  schedule_notes TEXT,
  schedule_redacted_fields TEXT[],
  schedule_updated_at TIMESTAMPTZ,

  emergency JSONB,
  emergency_notes TEXT,
  emergency_redacted_fields TEXT[],
  emergency_updated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### care_guides
Versioned care guide templates that can be shared.

```sql
CREATE TABLE care_guides (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id),
  child_ids UUID[],
  type TEXT NOT NULL, -- 'child', 'family', 'babysitter', 'school', 'grandparent'
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Structured content with sections
  share_view JSONB, -- Computed view respecting redactions
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### guide_shares
Shareable links with permissions, expiry, and access control.

```sql
CREATE TABLE guide_shares (
  id UUID PRIMARY KEY,
  guide_id UUID NOT NULL REFERENCES care_guides(id),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ,
  passcode_hash TEXT, -- Hashed passcode if required
  viewer_role TEXT, -- 'babysitter', 'teacher', 'family', etc.
  permissions JSONB, -- What sections are visible
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### guide_access_logs
Audit trail of who viewed shared guides and what actions they took.

```sql
CREATE TABLE guide_access_logs (
  id UUID PRIMARY KEY,
  share_id UUID NOT NULL REFERENCES guide_shares(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  actions_taken JSONB -- Track specific interactions
);
```

### sizes
Track current and next sizes for each child by category.

```sql
CREATE TABLE sizes (
  id UUID PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES children(id),
  category TEXT NOT NULL, -- 'tops', 'bottoms', 'shoes', 'outerwear', 'pajamas', 'underwear'
  current_size TEXT,
  next_size TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, category)
);
```

### ideas
AI-suggested or manually added ideas for things to buy or consider.

```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES children(id),
  title TEXT NOT NULL,
  category TEXT, -- 'clothing', 'gear', 'toys', 'books', etc.
  size TEXT,
  brand TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'added_to_wishlist', 'purchased', 'dismissed'
  source TEXT DEFAULT 'manual', -- 'ai', 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### wishlist_items
Items parents want to buy or have others buy as gifts.

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES children(id),
  title TEXT NOT NULL,
  size TEXT,
  brand TEXT,
  url TEXT,
  price_cents INTEGER,
  color TEXT,
  status TEXT DEFAULT 'needed', -- 'needed', 'reserved', 'purchased', 'received'
  reserved_by TEXT, -- Name/email of person who reserved it
  created_at TIMESTAMPTZ DEFAULT NOW(),
  purchased_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Redaction Model

Redaction happens at the **field level** within each section's JSONB:

```json
{
  "routines": {
    "wake_time": "7:00 AM",
    "bedtime": "8:00 PM"
  },
  "routines_redacted_fields": ["wake_time"]
}
```

When generating a `share_view`, fields in `redacted_fields` arrays are excluded from the output.

## Versioning

Care guides use simple integer versioning. When a guide is updated:
1. Check if any active shares exist
2. If yes, prompt: "Update guide or create new version?"
3. New version creates a new record with incremented version number
