-- Add missing due_date column to families table
-- This column should have been added by 20251107000009_add_due_date_to_families.sql
-- but it appears the migration was not applied correctly

ALTER TABLE families
ADD COLUMN IF NOT EXISTS due_date DATE;

COMMENT ON COLUMN families.due_date IS 'Expected due date for baby countdown feature. Null if not expecting.';
