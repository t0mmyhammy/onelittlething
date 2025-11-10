-- Add daily_mantra column to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS daily_mantra TEXT;

-- Add comment
COMMENT ON COLUMN user_preferences.daily_mantra IS 'User''s daily mantra, reminder, or quote';
