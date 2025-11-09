-- Add status and reserved_by fields to shopping_list_items
ALTER TABLE shopping_list_items
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'selected', 'reserved', 'purchased')),
ADD COLUMN IF NOT EXISTS reserved_by TEXT;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_status ON shopping_list_items(child_id, status);

-- Add sensitive flag for items that shouldn't be exported
ALTER TABLE shopping_list_items
ADD COLUMN IF NOT EXISTS sensitive BOOLEAN DEFAULT false;

-- Add last_updated tracking
ALTER TABLE shopping_list_items
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shopping_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_shopping_list_items_timestamp ON shopping_list_items;
CREATE TRIGGER update_shopping_list_items_timestamp
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_items_timestamp();
