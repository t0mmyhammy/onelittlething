-- Enable Row Level Security on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE parenting_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_parenting_styles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is a member of a family
CREATE OR REPLACE FUNCTION is_family_member(family_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM family_members
    WHERE family_id = family_id_param
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FAMILIES POLICIES
-- ========================================

-- Users can view families they're members of
CREATE POLICY "Users can view their families"
  ON families FOR SELECT
  USING (is_family_member(id));

-- Users can create a family
CREATE POLICY "Users can create families"
  ON families FOR INSERT
  WITH CHECK (true);

-- Users can update families they're members of
CREATE POLICY "Users can update their families"
  ON families FOR UPDATE
  USING (is_family_member(id))
  WITH CHECK (is_family_member(id));

-- ========================================
-- FAMILY MEMBERS POLICIES
-- ========================================

-- Users can view members of families they belong to
CREATE POLICY "Users can view family members"
  ON family_members FOR SELECT
  USING (is_family_member(family_id));

-- Users can add members to their families
CREATE POLICY "Users can add family members"
  ON family_members FOR INSERT
  WITH CHECK (is_family_member(family_id));

-- Users can remove members from their families
CREATE POLICY "Users can remove family members"
  ON family_members FOR DELETE
  USING (is_family_member(family_id));

-- ========================================
-- CHILDREN POLICIES
-- ========================================

-- Users can view children in their families
CREATE POLICY "Users can view family children"
  ON children FOR SELECT
  USING (is_family_member(family_id));

-- Users can add children to their families
CREATE POLICY "Users can add children"
  ON children FOR INSERT
  WITH CHECK (is_family_member(family_id));

-- Users can update children in their families
CREATE POLICY "Users can update children"
  ON children FOR UPDATE
  USING (is_family_member(family_id))
  WITH CHECK (is_family_member(family_id));

-- Users can delete children from their families
CREATE POLICY "Users can delete children"
  ON children FOR DELETE
  USING (is_family_member(family_id));

-- ========================================
-- ENTRIES POLICIES
-- ========================================

-- Users can view entries in their families
CREATE POLICY "Users can view family entries"
  ON entries FOR SELECT
  USING (is_family_member(family_id));

-- Users can create entries in their families
CREATE POLICY "Users can create entries"
  ON entries FOR INSERT
  WITH CHECK (
    is_family_member(family_id)
    AND created_by = auth.uid()
  );

-- Users can update their own entries
CREATE POLICY "Users can update their entries"
  ON entries FOR UPDATE
  USING (
    is_family_member(family_id)
    AND created_by = auth.uid()
  )
  WITH CHECK (
    is_family_member(family_id)
    AND created_by = auth.uid()
  );

-- Users can delete their own entries
CREATE POLICY "Users can delete their entries"
  ON entries FOR DELETE
  USING (
    is_family_member(family_id)
    AND created_by = auth.uid()
  );

-- ========================================
-- ENTRY_CHILDREN POLICIES
-- ========================================

-- Users can view entry-child relationships for their family's entries
CREATE POLICY "Users can view entry children"
  ON entry_children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = entry_children.entry_id
      AND is_family_member(entries.family_id)
    )
  );

-- Users can create entry-child relationships for their own entries
CREATE POLICY "Users can create entry children"
  ON entry_children FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = entry_children.entry_id
      AND entries.created_by = auth.uid()
      AND is_family_member(entries.family_id)
    )
  );

-- Users can delete entry-child relationships for their own entries
CREATE POLICY "Users can delete entry children"
  ON entry_children FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = entry_children.entry_id
      AND entries.created_by = auth.uid()
      AND is_family_member(entries.family_id)
    )
  );

-- ========================================
-- USER PREFERENCES POLICIES
-- ========================================

-- Users can view their own preferences
CREATE POLICY "Users can view their preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own preferences
CREATE POLICY "Users can insert their preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update their preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ========================================
-- PARENTING STYLES POLICIES
-- ========================================

-- Everyone can view parenting styles (they're public reference data)
CREATE POLICY "Everyone can view parenting styles"
  ON parenting_styles FOR SELECT
  USING (true);

-- ========================================
-- USER PARENTING STYLES POLICIES
-- ========================================

-- Users can view their own parenting style selection
CREATE POLICY "Users can view their parenting style"
  ON user_parenting_styles FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own parenting style
CREATE POLICY "Users can insert their parenting style"
  ON user_parenting_styles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own parenting style
CREATE POLICY "Users can update their parenting style"
  ON user_parenting_styles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
