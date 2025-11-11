-- Add hide_from_sharing field to child_size_categories
ALTER TABLE child_size_categories ADD COLUMN IF NOT EXISTS hide_from_sharing BOOLEAN DEFAULT FALSE;

-- Add comment to explain the field
COMMENT ON COLUMN child_size_categories.hide_from_sharing IS 'When true, this size category will not be included in shared lists';
