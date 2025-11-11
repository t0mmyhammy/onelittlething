-- Add date tracking columns to shopping_list_items
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_reserved_at ON shopping_list_items(reserved_at);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_purchased_at ON shopping_list_items(purchased_at);
