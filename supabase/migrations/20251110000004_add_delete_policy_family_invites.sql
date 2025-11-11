-- Add DELETE policy for family_invites so family members can cancel invites
CREATE POLICY "Family members can delete invites"
  ON family_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_invites.family_id
      AND family_members.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Family members can delete invites" ON family_invites IS
  'Allows family members to cancel pending invitations';
