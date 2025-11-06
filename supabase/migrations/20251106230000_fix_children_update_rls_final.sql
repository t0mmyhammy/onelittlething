-- Final fix for children UPDATE RLS policy
-- The issue is that WITH CHECK evaluates the NEW row
-- Since we never change family_id, we can simplify the policy

-- Drop all existing update policies
DROP POLICY IF EXISTS "Users can update children" ON children;

-- Create a policy that only checks the existing row (USING clause)
-- The WITH CHECK clause ensures family_id doesn't change (or if it does, user is still a member)
CREATE POLICY "Users can update children"
  ON children FOR UPDATE
  USING (
    -- Check if user is a member of the child's current family (OLD row)
    EXISTS (
      SELECT 1 
      FROM family_members fm
      WHERE fm.family_id = children.family_id
      AND fm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Ensure the updated row still belongs to a family the user is a member of
    -- This prevents changing family_id to a family the user doesn't belong to
    EXISTS (
      SELECT 1 
      FROM family_members fm
      WHERE fm.family_id = children.family_id
      AND fm.user_id = auth.uid()
    )
  );

