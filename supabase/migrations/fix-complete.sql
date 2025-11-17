-- Step 1: Add missing due_date column to families table
ALTER TABLE families
ADD COLUMN IF NOT EXISTS due_date DATE;

COMMENT ON COLUMN families.due_date IS 'Expected due date for baby countdown feature. Null if not expecting.';

-- Step 2: Migrate child birthdates to family due_dates
-- This sets the due_date to the youngest child's birthdate for each family
UPDATE families f
SET due_date = (
  SELECT c.birthdate
  FROM children c
  WHERE c.family_id = f.id
  ORDER BY c.birthdate DESC
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM children c WHERE c.family_id = f.id
);

-- Step 3: Show the results
SELECT
  f.id,
  f.name,
  f.due_date,
  (SELECT COUNT(*) FROM children WHERE family_id = f.id) as child_count,
  (SELECT name FROM children WHERE family_id = f.id ORDER BY birthdate DESC LIMIT 1) as youngest_child_name
FROM families f;
