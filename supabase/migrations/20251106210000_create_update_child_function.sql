-- Create a function to update children that bypasses RLS issues
-- SECURITY DEFINER functions run with the privileges of the function owner (postgres)
-- This bypasses RLS policies
CREATE OR REPLACE FUNCTION update_child(
  child_id UUID,
  child_name TEXT,
  child_birthdate DATE,
  child_gender TEXT,
  child_photo_url TEXT
)
RETURNS void AS $$
DECLARE
  child_family_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Get the child's family_id
  SELECT c.family_id INTO child_family_id
  FROM children c
  WHERE c.id = child_id;
  
  IF child_family_id IS NULL THEN
    RAISE EXCEPTION 'Child not found';
  END IF;
  
  -- Verify user is a family member
  IF NOT EXISTS (
    SELECT 1 FROM family_members
    WHERE family_id = child_family_id
    AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Permission denied: You are not a member of this child''s family';
  END IF;

  -- Update the child
  -- SECURITY DEFINER means this runs as the function owner (postgres), bypassing RLS
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

