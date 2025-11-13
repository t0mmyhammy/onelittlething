-- Add account deletion tracking to user_preferences
-- This is a SOFT DELETE - we keep all user data but mark them as deleted
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS account_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS account_deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add helpful comments
COMMENT ON COLUMN user_preferences.account_deleted IS 'True if user has deleted/deactivated their account (soft delete)';
COMMENT ON COLUMN user_preferences.account_deleted_at IS 'Timestamp when account was deleted';

-- Create a function to soft-delete a user account
-- This marks the user as deleted but keeps all their data
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

COMMENT ON FUNCTION delete_user_account IS 'Soft-deletes a user account - removes them from families and deletes auth user, but keeps all their entries/data intact';
