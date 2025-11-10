-- Create family_invites table
CREATE TABLE IF NOT EXISTS family_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(family_id, email)
);

-- Add RLS policies
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;

-- Family members can view invites for their family
CREATE POLICY "Family members can view invites"
  ON family_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_invites.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Family members can create invites for their family
CREATE POLICY "Family members can create invites"
  ON family_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_invites.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Family members can update invites for their family
CREATE POLICY "Family members can update invites"
  ON family_invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_invites.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_family_invites_token ON family_invites(token);
CREATE INDEX IF NOT EXISTS idx_family_invites_email ON family_invites(email);
CREATE INDEX IF NOT EXISTS idx_family_invites_status ON family_invites(status);

COMMENT ON TABLE family_invites IS 'Pending family invitations sent via email';
