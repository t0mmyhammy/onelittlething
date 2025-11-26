-- Add audio_url column to entries table for voice recording attachments
ALTER TABLE entries
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN entries.audio_url IS 'URL to audio recording stored in entry-audio bucket (max 30 seconds)';

-- Create storage bucket for entry audio recordings if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('entry-audio', 'entry-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for entry audio (similar to entry-photos pattern)
-- Anyone can view audio (public bucket)
CREATE POLICY "Anyone can view entry audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'entry-audio');

-- Authenticated users can upload audio
CREATE POLICY "Authenticated users can upload entry audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'entry-audio'
  AND auth.uid() IS NOT NULL
);

-- Authenticated users can update their uploads
CREATE POLICY "Authenticated users can update entry audio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'entry-audio'
  AND auth.uid() IS NOT NULL
);

-- Authenticated users can delete audio
CREATE POLICY "Authenticated users can delete entry audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'entry-audio'
  AND auth.uid() IS NOT NULL
);
