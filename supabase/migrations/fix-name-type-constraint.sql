-- Fix baby_name_ideas type constraint to allow 'first' and 'middle'

-- Step 1: Drop the old check constraint
ALTER TABLE baby_name_ideas
DROP CONSTRAINT IF EXISTS baby_name_ideas_type_check;

-- Step 2: Add new check constraint with new values
ALTER TABLE baby_name_ideas
ADD CONSTRAINT baby_name_ideas_type_check
CHECK (type IN ('F', 'M', 'N', 'first', 'middle'));

-- Step 3: Add order_index if it doesn't exist
ALTER TABLE baby_name_ideas
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Step 4: Create index for efficient sorting
CREATE INDEX IF NOT EXISTS baby_name_ideas_order_idx
ON baby_name_ideas(family_id, order_index);

-- Step 5: Migrate existing data from old to new values
-- Convert all gender-based types to position-based types
UPDATE baby_name_ideas
SET type = 'first'
WHERE type IN ('F', 'M', 'N');

-- Step 6 (Optional): If you want to enforce ONLY new values, uncomment below:
-- ALTER TABLE baby_name_ideas
-- DROP CONSTRAINT baby_name_ideas_type_check;
--
-- ALTER TABLE baby_name_ideas
-- ADD CONSTRAINT baby_name_ideas_type_check
-- CHECK (type IN ('first', 'middle'));

-- Verify the changes
SELECT
  id,
  name,
  type,
  order_index,
  is_favorite
FROM baby_name_ideas
ORDER BY family_id, order_index, created_at DESC;
