-- Add favorite field to baby_name_ideas for marking finalists
ALTER TABLE baby_name_ideas
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN baby_name_ideas.is_favorite IS 'True if this name is marked as a favorite/finalist';

-- Create index for faster favorite filtering
CREATE INDEX IF NOT EXISTS baby_name_ideas_favorite_idx ON baby_name_ideas(family_id, is_favorite) WHERE is_favorite = TRUE;
