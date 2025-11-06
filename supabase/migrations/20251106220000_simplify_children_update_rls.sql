-- Simplify children UPDATE RLS policy
-- Drop all existing update policies first
DROP POLICY IF EXISTS "Users can update children" ON children;

-- Create a simple policy that checks the existing row's family_id
-- The USING clause checks if the user can update (based on OLD row)
-- The WITH CHECK clause ensures the NEW row still belongs to a family the user is a member of
-- Since we never change family_id, both should pass if the user is a member
CREATE POLICY "Users can update children"
  ON children FOR UPDATE
  USING (
    -- Check if user is a member of the child's current family
    EXISTS (
      SELECT 1 
      FROM family_members fm
      WHERE fm.family_id = children.family_id
      AND fm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Ensure the updated row still belongs to a family the user is a member of
    -- Since we don't change family_id, this should always pass if USING passes
    EXISTS (
      SELECT 1 
      FROM family_members fm
      WHERE fm.family_id = children.family_id
      AND fm.user_id = auth.uid()
    )
  );

