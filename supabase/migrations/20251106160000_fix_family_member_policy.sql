-- Fix family_members INSERT policy to allow users to add themselves when creating a family
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can add family members" ON family_members;

-- Create a new policy that allows:
-- 1. Users to add themselves to a family (for initial family creation)
-- 2. Existing family members to add other members
CREATE POLICY "Users can add family members"
  ON family_members FOR INSERT
  WITH CHECK (
    -- Allow if user is adding themselves
    user_id = auth.uid()
    OR
    -- Allow if user is already a member of the family (for adding others)
    is_family_member(family_id)
  );

