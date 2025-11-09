-- Add parenting style selection to user preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS selected_parenting_style TEXT DEFAULT 'love-and-logic';

-- Create table for custom parenting styles
CREATE TABLE IF NOT EXISTS custom_parenting_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  core_principles TEXT[] NOT NULL,
  approach_to_discipline TEXT,
  approach_to_communication TEXT,
  key_phrases TEXT[],
  recommended_age_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_parenting_styles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_parenting_styles
CREATE POLICY "Users can view their own custom styles"
  ON custom_parenting_styles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom styles"
  ON custom_parenting_styles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom styles"
  ON custom_parenting_styles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom styles"
  ON custom_parenting_styles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_parenting_styles_updated_at
  BEFORE UPDATE ON custom_parenting_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
