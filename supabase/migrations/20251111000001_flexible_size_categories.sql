-- Create a flexible size categories table
CREATE TABLE IF NOT EXISTS child_size_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- shoes, pants, shirts, diapers, coat, hat, gloves, etc.
  current_size TEXT,
  next_size TEXT,
  fit_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, category)
);

-- Add RLS policies
ALTER TABLE child_size_categories ENABLE ROW LEVEL SECURITY;

-- Users can view size categories for children in their family
CREATE POLICY "Users can view size categories for their family children"
  ON child_size_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = child_size_categories.child_id
      AND fm.user_id = auth.uid()
    )
  );

-- Users can insert size categories for children in their family
CREATE POLICY "Users can insert size categories for their family children"
  ON child_size_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = child_size_categories.child_id
      AND fm.user_id = auth.uid()
    )
  );

-- Users can update size categories for children in their family
CREATE POLICY "Users can update size categories for their family children"
  ON child_size_categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = child_size_categories.child_id
      AND fm.user_id = auth.uid()
    )
  );

-- Users can delete size categories for children in their family
CREATE POLICY "Users can delete size categories for their family children"
  ON child_size_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = child_size_categories.child_id
      AND fm.user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX idx_child_size_categories_child_id ON child_size_categories(child_id);

-- Migrate existing data from child_sizes table
INSERT INTO child_size_categories (child_id, category, current_size, next_size)
SELECT
  child_id,
  'Shoes' as category,
  split_part(shoe_size, '/', 1) as current_size,
  split_part(shoe_size, '/', 2) as next_size
FROM child_sizes
WHERE shoe_size IS NOT NULL AND shoe_size != ''
ON CONFLICT (child_id, category) DO NOTHING;

INSERT INTO child_size_categories (child_id, category, current_size, next_size)
SELECT
  child_id,
  'Pants' as category,
  split_part(pants_size, '/', 1) as current_size,
  split_part(pants_size, '/', 2) as next_size
FROM child_sizes
WHERE pants_size IS NOT NULL AND pants_size != ''
ON CONFLICT (child_id, category) DO NOTHING;

INSERT INTO child_size_categories (child_id, category, current_size, next_size)
SELECT
  child_id,
  'Shirts' as category,
  split_part(shirt_size, '/', 1) as current_size,
  split_part(shirt_size, '/', 2) as next_size
FROM child_sizes
WHERE shirt_size IS NOT NULL AND shirt_size != ''
ON CONFLICT (child_id, category) DO NOTHING;
