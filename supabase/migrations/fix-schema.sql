-- Add missing due_date column to families table
ALTER TABLE families
ADD COLUMN IF NOT EXISTS due_date DATE;

COMMENT ON COLUMN families.due_date IS 'Expected due date for baby countdown feature. Null if not expecting.';
