-- Create pack_lists table
CREATE TABLE IF NOT EXISTS pack_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INTEGER,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT false
);

-- Create pack_list_categories table
CREATE TABLE IF NOT EXISTS pack_list_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_list_id UUID NOT NULL REFERENCES pack_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pack_list_items table
CREATE TABLE IF NOT EXISTS pack_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES pack_list_categories(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  quantity INTEGER,
  is_complete BOOLEAN DEFAULT false,
  completed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX pack_lists_family_id_idx ON pack_lists(family_id);
CREATE INDEX pack_lists_last_used_at_idx ON pack_lists(last_used_at);
CREATE INDEX pack_lists_is_archived_idx ON pack_lists(is_archived);
CREATE INDEX pack_list_categories_pack_list_id_idx ON pack_list_categories(pack_list_id);
CREATE INDEX pack_list_categories_order_idx ON pack_list_categories(pack_list_id, order_index);
CREATE INDEX pack_list_items_category_id_idx ON pack_list_items(category_id);
CREATE INDEX pack_list_items_order_idx ON pack_list_items(category_id, order_index);

-- Enable RLS
ALTER TABLE pack_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_list_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pack_lists
CREATE POLICY "Users can view pack lists in their family"
  ON pack_lists FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pack lists in their family"
  ON pack_lists FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pack lists in their family"
  ON pack_lists FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pack lists in their family"
  ON pack_lists FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for pack_list_categories
CREATE POLICY "Users can view categories for pack lists in their family"
  ON pack_list_categories FOR SELECT
  USING (
    pack_list_id IN (
      SELECT id FROM pack_lists WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create categories for pack lists in their family"
  ON pack_list_categories FOR INSERT
  WITH CHECK (
    pack_list_id IN (
      SELECT id FROM pack_lists WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update categories for pack lists in their family"
  ON pack_list_categories FOR UPDATE
  USING (
    pack_list_id IN (
      SELECT id FROM pack_lists WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete categories for pack lists in their family"
  ON pack_list_categories FOR DELETE
  USING (
    pack_list_id IN (
      SELECT id FROM pack_lists WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for pack_list_items
CREATE POLICY "Users can view items for pack lists in their family"
  ON pack_list_items FOR SELECT
  USING (
    category_id IN (
      SELECT id FROM pack_list_categories WHERE pack_list_id IN (
        SELECT id FROM pack_lists WHERE family_id IN (
          SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create items for pack lists in their family"
  ON pack_list_items FOR INSERT
  WITH CHECK (
    category_id IN (
      SELECT id FROM pack_list_categories WHERE pack_list_id IN (
        SELECT id FROM pack_lists WHERE family_id IN (
          SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update items for pack lists in their family"
  ON pack_list_items FOR UPDATE
  USING (
    category_id IN (
      SELECT id FROM pack_list_categories WHERE pack_list_id IN (
        SELECT id FROM pack_lists WHERE family_id IN (
          SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can delete items for pack lists in their family"
  ON pack_list_items FOR DELETE
  USING (
    category_id IN (
      SELECT id FROM pack_list_categories WHERE pack_list_id IN (
        SELECT id FROM pack_lists WHERE family_id IN (
          SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pack_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_pack_list_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_pack_list_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER pack_lists_updated_at
  BEFORE UPDATE ON pack_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_pack_lists_updated_at();

CREATE TRIGGER pack_list_categories_updated_at
  BEFORE UPDATE ON pack_list_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_pack_list_categories_updated_at();

CREATE TRIGGER pack_list_items_updated_at
  BEFORE UPDATE ON pack_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_pack_list_items_updated_at();
