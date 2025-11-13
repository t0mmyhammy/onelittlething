-- Add onboarding tracking fields to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_dismissed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_family_creator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step_child_added BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step_first_moment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step_partner_invited BOOLEAN DEFAULT false;

-- Add helpful comment
COMMENT ON COLUMN user_preferences.is_family_creator IS 'True if this user created their own family (vs joining existing)';
COMMENT ON COLUMN user_preferences.onboarding_completed IS 'True when all required onboarding steps are done';
COMMENT ON COLUMN user_preferences.onboarding_dismissed IS 'True if user manually dismissed the onboarding checklist';
