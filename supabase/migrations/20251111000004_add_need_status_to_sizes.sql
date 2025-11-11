-- Add need_status column to child_size_categories
ALTER TABLE child_size_categories ADD COLUMN IF NOT EXISTS need_status TEXT DEFAULT 'have_enough';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_child_size_categories_need_status ON child_size_categories(need_status);

-- Add comment explaining the field
COMMENT ON COLUMN child_size_categories.need_status IS 'Status of need for this size category: have_enough, need_next_size, need_now, dont_need';
