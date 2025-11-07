-- Add label_color column to children table
ALTER TABLE children ADD COLUMN IF NOT EXISTS label_color TEXT DEFAULT 'amber';
