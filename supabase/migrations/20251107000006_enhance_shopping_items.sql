-- Add new columns to shopping_list_items
ALTER TABLE shopping_list_items
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Create index for URL lookups
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_url ON shopping_list_items(url) WHERE url IS NOT NULL;
