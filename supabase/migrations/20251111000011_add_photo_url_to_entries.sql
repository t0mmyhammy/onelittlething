-- Add photo_url column to entries table for photo attachments
ALTER TABLE entries
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN entries.photo_url IS 'URL to photo stored in entry-photos bucket';
