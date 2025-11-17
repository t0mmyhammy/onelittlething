-- Add fields to track if baby is named and if names should be hidden
ALTER TABLE baby_prep_lists
ADD COLUMN IF NOT EXISTS baby_named BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hide_names BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN baby_prep_lists.baby_named IS 'True if the baby has been officially named';
COMMENT ON COLUMN baby_prep_lists.hide_names IS 'True if name ideas should be hidden for privacy';
