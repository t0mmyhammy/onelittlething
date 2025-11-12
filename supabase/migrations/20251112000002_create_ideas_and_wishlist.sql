-- Ideas and Wishlist System
-- Separates AI-generated/manual ideas from actionable wishlist items

-- =============================================
-- IDEAS TABLE
-- AI-suggested or manually added ideas for things to consider
-- =============================================
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,

  -- Item details
  title TEXT NOT NULL,
  category TEXT, -- 'clothing', 'gear', 'toys', 'books', etc.
  size TEXT,
  brand TEXT,
  notes TEXT,

  -- Status and source
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'added_to_wishlist', 'purchased', 'dismissed')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('ai', 'manual')),

  -- AI metadata
  ai_rationale TEXT, -- Why AI suggested this
  ai_prompt TEXT, -- Original prompt that generated this

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ideas_child ON ideas(child_id, created_at DESC);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_source ON ideas(source);

-- =============================================
-- WISHLIST ITEMS TABLE
-- Actionable items parents want to buy or receive as gifts
-- =============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,

  -- Item details
  title TEXT NOT NULL,
  size TEXT,
  brand TEXT,
  url TEXT,
  price_cents INTEGER,
  color TEXT,
  notes TEXT,

  -- Status tracking
  status TEXT DEFAULT 'needed' CHECK (status IN ('needed', 'reserved', 'purchased', 'received')),

  -- Gift coordination
  reserved_by TEXT, -- Name or email of person who reserved
  reserved_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,

  -- Privacy
  hide_from_sharing BOOLEAN DEFAULT false,

  -- Source tracking
  idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wishlist_child ON wishlist_items(child_id, created_at DESC);
CREATE INDEX idx_wishlist_status ON wishlist_items(status);
CREATE INDEX idx_wishlist_idea ON wishlist_items(idea_id);

-- =============================================
-- UPDATE TRIGGERS
-- =============================================
CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Ideas policies
CREATE POLICY "Users can view ideas for their family's children"
  ON ideas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = ideas.child_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ideas for their family's children"
  ON ideas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = ideas.child_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ideas for their family's children"
  ON ideas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = ideas.child_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ideas for their family's children"
  ON ideas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = ideas.child_id
      AND fm.user_id = auth.uid()
    )
  );

-- Wishlist items policies
CREATE POLICY "Users can view wishlist items for their family's children"
  ON wishlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = wishlist_items.child_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert wishlist items for their family's children"
  ON wishlist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = wishlist_items.child_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update wishlist items for their family's children"
  ON wishlist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = wishlist_items.child_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete wishlist items for their family's children"
  ON wishlist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = wishlist_items.child_id
      AND fm.user_id = auth.uid()
    )
  );
