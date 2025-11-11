-- Create a function to get basic user info from auth.users
-- This is a security definer function that bypasses RLS to read auth.users
CREATE OR REPLACE FUNCTION get_user_info(user_ids UUID[])
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id,
    au.email::TEXT,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email::TEXT) AS full_name
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_info(UUID[]) TO authenticated;

COMMENT ON FUNCTION get_user_info IS 'Fetch basic user information (email, name) for given user IDs. Used for displaying entry creators.';
