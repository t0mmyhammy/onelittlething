-- Fix the chicken-and-egg problem with family_members INSERT policy
-- Allow users to add themselves to a family (for initial signup)
-- Also allow existing family members to add new members

DROP POLICY IF EXISTS "Users can add family members" ON family_members;

CREATE POLICY "Users can add family members"
  ON family_members FOR INSERT
  WITH CHECK (
    -- Allow adding yourself to any family (needed for initial signup)
    user_id = auth.uid()
    OR
    -- Allow existing family members to add new members
    is_family_member(family_id)
  );

-- Create helper RPC function for atomic family creation with member
-- This ensures family + member creation happens together
CREATE OR REPLACE FUNCTION create_family_with_member(
  family_name TEXT,
  member_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  new_family_id UUID;
BEGIN
  -- Insert family
  INSERT INTO families (name)
  VALUES (family_name)
  RETURNING id INTO new_family_id;

  -- Add user as family member
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (new_family_id, member_user_id, 'parent');

  -- Create user preferences if they don't exist
  INSERT INTO user_preferences (user_id)
  VALUES (member_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create an RPC function for updating children
-- This helps with the photo upload RLS issues
CREATE OR REPLACE FUNCTION update_child(
  child_id UUID,
  child_name TEXT,
  child_birthdate DATE DEFAULT NULL,
  child_gender TEXT DEFAULT NULL,
  child_photo_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  child_family_id UUID;
BEGIN
  -- Get the child's family_id
  SELECT family_id INTO child_family_id
  FROM children
  WHERE id = child_id;

  -- Check if user is a member of the child's family
  IF NOT is_family_member(child_family_id) THEN
    RAISE EXCEPTION 'Not authorized to update this child';
  END IF;

  -- Update the child
  UPDATE children
  SET
    name = child_name,
    birthdate = child_birthdate,
    gender = child_gender,
    photo_url = child_photo_url,
    updated_at = NOW()
  WHERE id = child_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
