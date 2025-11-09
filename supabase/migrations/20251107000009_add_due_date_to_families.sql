-- Add due_date column to families table for pregnancy countdown
ALTER TABLE families
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN families.due_date IS 'Expected due date for baby countdown feature. Null if not expecting.';
