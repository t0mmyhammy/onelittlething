-- Add archived column to shopping_list_items
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_archived ON shopping_list_items(archived);
