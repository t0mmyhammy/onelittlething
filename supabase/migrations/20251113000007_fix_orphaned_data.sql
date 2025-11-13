-- Fix orphaned pack lists and reminders that were created with empty family_id
-- This happened due to a navigation bug that caused familyId to be empty

-- Fix orphaned pack lists
-- Update pack lists where family_id is empty/null but we can find the family via the creator
UPDATE pack_lists
SET family_id = (
  SELECT fm.family_id
  FROM family_members fm
  WHERE fm.user_id = pack_lists.created_by_user_id
  LIMIT 1
)
WHERE (family_id IS NULL OR family_id = '')
  AND created_by_user_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM family_members fm
    WHERE fm.user_id = pack_lists.created_by_user_id
  );

-- Fix orphaned reminders
-- Update reminders where family_id is empty/null but we can find the family via the creator
UPDATE reminders
SET family_id = (
  SELECT fm.family_id
  FROM family_members fm
  WHERE fm.user_id = reminders.created_by
  LIMIT 1
)
WHERE (family_id IS NULL OR family_id = '')
  AND created_by IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM family_members fm
    WHERE fm.user_id = reminders.created_by
  );

-- Log what we fixed
DO $$
DECLARE
  pack_lists_fixed INTEGER;
  reminders_fixed INTEGER;
BEGIN
  -- Count how many we could have fixed (this is after the update, so will be 0)
  SELECT COUNT(*) INTO pack_lists_fixed
  FROM pack_lists
  WHERE (family_id IS NULL OR family_id = '');

  SELECT COUNT(*) INTO reminders_fixed
  FROM reminders
  WHERE (family_id IS NULL OR family_id = '');

  RAISE NOTICE 'Migration complete. Pack lists still orphaned: %, Reminders still orphaned: %',
    pack_lists_fixed, reminders_fixed;
END $$;
