-- Run this in Supabase SQL Editor to add account deletion feature

-- Add account deletion tracking to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS account_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS account_deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create a function to soft-delete a user account
CREATE OR REPLACE FUNCTION delete_user_account(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark user preferences as deleted
  UPDATE user_preferences
  SET
    account_deleted = true,
    account_deleted_at = NOW()
  WHERE user_id = user_id_param;

  -- Remove user from all families
  DELETE FROM family_members
  WHERE user_id = user_id_param;

  -- Delete the auth user (this will trigger Supabase to sign them out)
  DELETE FROM auth.users
  WHERE id = user_id_param;

  RETURN true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Verify function was created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'delete_user_account'
AND routine_schema = 'public';
