-- Drop existing check constraint on inventory_items state
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_state_check;

-- Update existing inventory_items states to new values
UPDATE inventory_items
SET state = CASE
  WHEN state = 'need_it' THEN 'idea'
  WHEN state = 'dont_need_it' THEN 'research'
  WHEN state = 'hidden' THEN 'research'
  ELSE 'idea'
END
WHERE state IN ('need_it', 'dont_need_it', 'hidden');

-- Add new check constraint with updated values
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_state_check
  CHECK (state IN ('idea', 'research'));

-- Add columns for tracking who created/modified items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS modified_by UUID REFERENCES auth.users(id);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;

-- Rename fit_notes to notes for clarity
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'fit_notes'
  ) THEN
    ALTER TABLE inventory_items RENAME COLUMN fit_notes TO notes;
  END IF;
END $$;

-- Add created_by to child_size_categories
ALTER TABLE child_size_categories ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE child_size_categories ADD COLUMN IF NOT EXISTS modified_by UUID REFERENCES auth.users(id);
ALTER TABLE child_size_categories ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;

-- Rename fit_notes to notes in child_size_categories
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'child_size_categories' AND column_name = 'fit_notes'
  ) THEN
    ALTER TABLE child_size_categories RENAME COLUMN fit_notes TO notes;
  END IF;
END $$;
