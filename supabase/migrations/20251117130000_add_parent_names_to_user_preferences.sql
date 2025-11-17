-- Add parent_names field to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS parent_names TEXT[] DEFAULT '{}';

COMMENT ON COLUMN user_preferences.parent_names IS 'Names of parents for family fit display';
