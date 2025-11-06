-- Fix children UPDATE RLS policy
-- Use explicit EXISTS check instead of function to ensure it works correctly

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can update children" ON children;

-- Recreate with explicit EXISTS check
-- USING checks the OLD row, WITH CHECK checks the NEW row
-- Since we don't change family_id, both should evaluate the same
CREATE POLICY "Users can update children"
  ON children FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = children.family_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = children.family_id
      AND user_id = auth.uid()
    )
  );

