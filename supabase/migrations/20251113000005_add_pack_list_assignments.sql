-- Add participants to pack_lists (which kids/people are going on this trip)
ALTER TABLE pack_lists ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]'::jsonb;

-- Add assignment fields to pack_list_items
ALTER TABLE pack_list_items ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE pack_list_items ADD COLUMN IF NOT EXISTS assigned_type TEXT CHECK (assigned_type IN ('child', 'parent', 'all'));

-- Add comments for clarity
COMMENT ON COLUMN pack_lists.participants IS 'Array of child IDs participating in this trip';
COMMENT ON COLUMN pack_list_items.assigned_to IS 'UUID of child or user this item is assigned to (null means all)';
COMMENT ON COLUMN pack_list_items.assigned_type IS 'Type of assignment: child, parent, or all';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS pack_list_items_assigned_to_idx ON pack_list_items(assigned_to);
