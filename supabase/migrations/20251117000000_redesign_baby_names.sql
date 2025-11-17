-- Redesign baby names schema for Apple-like UI
-- Changes type from gender (F/M/N) to position (first/middle)
-- Adds order_index for custom sorting

-- Add order_index column for drag-to-reorder
ALTER TABLE baby_name_ideas
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Update type column to use new values
-- Note: This will require data migration for existing names
-- Old values: 'F' (Female), 'M' (Male), 'N' (Neutral)
-- New values: 'first', 'middle'

-- For now, add a comment about the transition
COMMENT ON COLUMN baby_name_ideas.type IS 'Name position: first or middle (legacy values F/M/N may exist)';
COMMENT ON COLUMN baby_name_ideas.order_index IS 'Custom sort order for name cards';

-- Create index for efficient sorting
CREATE INDEX IF NOT EXISTS baby_name_ideas_order_idx ON baby_name_ideas(family_id, order_index);

-- Note: To migrate existing data, run:
-- UPDATE baby_name_ideas SET type = 'first' WHERE type IN ('F', 'M', 'N');
