-- Add tier system and AI-added tracking to baby_name_ideas
-- Tiers: 1 = Love, 2 = Like, 3 = Maybe, null = unranked

ALTER TABLE baby_name_ideas
ADD COLUMN IF NOT EXISTS tier INTEGER CHECK (tier IN (1, 2, 3)),
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN baby_name_ideas.tier IS 'Name tier: 1=Love, 2=Like, 3=Maybe, null=unranked';
COMMENT ON COLUMN baby_name_ideas.is_ai_generated IS 'True if this name was suggested by AI';

-- Create index for efficient tier filtering
CREATE INDEX IF NOT EXISTS baby_name_ideas_tier_idx ON baby_name_ideas(family_id, tier);
CREATE INDEX IF NOT EXISTS baby_name_ideas_ai_generated_idx ON baby_name_ideas(family_id, is_ai_generated);
