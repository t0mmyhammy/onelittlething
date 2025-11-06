-- Create a function to create a family and add the user as a member in one transaction
-- This bypasses RLS issues when creating a new family
CREATE OR REPLACE FUNCTION create_family_with_member(family_name TEXT, member_user_id UUID)
RETURNS UUID AS $$
DECLARE
  new_family_id UUID;
BEGIN
  -- Create the family
  INSERT INTO families (name)
  VALUES (family_name)
  RETURNING id INTO new_family_id;
  
  -- Add the user as a family member
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (new_family_id, member_user_id, 'parent');
  
  RETURN new_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

