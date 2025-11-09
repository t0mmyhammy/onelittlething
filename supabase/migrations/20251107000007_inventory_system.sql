-- Create inventory_items table for tracking child's items
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  size TEXT,
  fit_notes TEXT,
  brand TEXT,
  state TEXT NOT NULL DEFAULT 'need_it' CHECK (state IN ('need_it', 'dont_need_it', 'hidden')),
  next_size_up BOOLEAN DEFAULT false,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_child_id ON inventory_items(child_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(child_id, category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_state ON inventory_items(child_id, state);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view inventory for their family's children" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory for their family's children" ON inventory_items;
DROP POLICY IF EXISTS "Users can update inventory for their family's children" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory for their family's children" ON inventory_items;

-- RLS Policies for inventory_items
CREATE POLICY "Users can view inventory for their family's children"
  ON inventory_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      JOIN family_members ON children.family_id = family_members.family_id
      WHERE children.id = inventory_items.child_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert inventory for their family's children"
  ON inventory_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      JOIN family_members ON children.family_id = family_members.family_id
      WHERE children.id = inventory_items.child_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update inventory for their family's children"
  ON inventory_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      JOIN family_members ON children.family_id = family_members.family_id
      WHERE children.id = inventory_items.child_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete inventory for their family's children"
  ON inventory_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      JOIN family_members ON children.family_id = family_members.family_id
      WHERE children.id = inventory_items.child_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_inventory_items_timestamp ON inventory_items;
CREATE TRIGGER update_inventory_items_timestamp
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_timestamp();
