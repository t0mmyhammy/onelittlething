-- Create child_sizes table to track clothing/shoe sizes
CREATE TABLE IF NOT EXISTS child_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  shoe_size TEXT,
  pants_size TEXT,
  shirt_size TEXT,
  notes TEXT,
  favorite_colors TEXT,
  favorite_styles TEXT,
  favorite_brands TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id)
);

-- Create shopping_list_items table for needs tracking
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT, -- e.g., "clothing", "shoes", "accessories"
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_child_sizes_child_id ON child_sizes(child_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_child_id ON shopping_list_items(child_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_family_id ON shopping_list_items(family_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_completed ON shopping_list_items(family_id, is_completed);

-- Enable RLS
ALTER TABLE child_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for child_sizes
CREATE POLICY "Users can view sizes for their family's children"
  ON child_sizes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      JOIN family_members ON children.family_id = family_members.family_id
      WHERE children.id = child_sizes.child_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sizes for their family's children"
  ON child_sizes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      JOIN family_members ON children.family_id = family_members.family_id
      WHERE children.id = child_sizes.child_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sizes for their family's children"
  ON child_sizes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      JOIN family_members ON children.family_id = family_members.family_id
      WHERE children.id = child_sizes.child_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sizes for their family's children"
  ON child_sizes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      JOIN family_members ON children.family_id = family_members.family_id
      WHERE children.id = child_sizes.child_id
      AND family_members.user_id = auth.uid()
    )
  );

-- RLS Policies for shopping_list_items
CREATE POLICY "Users can view shopping items for their family"
  ON shopping_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = shopping_list_items.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert shopping items for their family"
  ON shopping_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = shopping_list_items.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update shopping items for their family"
  ON shopping_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = shopping_list_items.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shopping items for their family"
  ON shopping_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = shopping_list_items.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sizes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_child_sizes_timestamp
  BEFORE UPDATE ON child_sizes
  FOR EACH ROW
  EXECUTE FUNCTION update_sizes_timestamp();

CREATE TRIGGER update_shopping_list_items_timestamp
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_sizes_timestamp();
