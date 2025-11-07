-- Add archived column to children table
ALTER TABLE children ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
