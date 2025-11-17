-- Step 1: Add privacy and status fields to baby_prep_lists
ALTER TABLE baby_prep_lists
ADD COLUMN IF NOT EXISTS baby_named BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hide_names BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN baby_prep_lists.baby_named IS 'True if the baby has been officially named';
COMMENT ON COLUMN baby_prep_lists.hide_names IS 'True if name ideas should be hidden for privacy';

-- Step 2: Add favorite field to baby_name_ideas
ALTER TABLE baby_name_ideas
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN baby_name_ideas.is_favorite IS 'True if this name is marked as a favorite/finalist';

-- Create index for faster favorite filtering
CREATE INDEX IF NOT EXISTS baby_name_ideas_favorite_idx ON baby_name_ideas(family_id, is_favorite) WHERE is_favorite = TRUE;

-- Verify all columns were added
SELECT
  'baby_prep_lists' as table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'baby_prep_lists'
AND column_name IN ('baby_named', 'hide_names')
UNION ALL
SELECT
  'baby_name_ideas' as table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'baby_name_ideas'
AND column_name = 'is_favorite';
