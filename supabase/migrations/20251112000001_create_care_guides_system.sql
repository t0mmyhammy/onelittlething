-- Care Guides System
-- Enables parents to create shareable guides for caregivers (babysitters, teachers, family)

-- =============================================
-- CHILD CARE INFO
-- Stores structured information about each child
-- =============================================
CREATE TABLE IF NOT EXISTS child_care_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,

  -- Routines section (wake, naps, meals, bedtime)
  routines JSONB DEFAULT '{}'::jsonb,
  routines_notes TEXT,
  routines_updated_at TIMESTAMPTZ,
  routines_redacted_fields TEXT[] DEFAULT '{}',

  -- Health section (allergies, medications, conditions, action plans)
  health JSONB DEFAULT '{}'::jsonb,
  health_notes TEXT,
  health_updated_at TIMESTAMPTZ,
  health_redacted_fields TEXT[] DEFAULT '{}',

  -- Comfort section (calming tips, favorites, dislikes, special items)
  comfort JSONB DEFAULT '{}'::jsonb,
  comfort_notes TEXT,
  comfort_updated_at TIMESTAMPTZ,
  comfort_redacted_fields TEXT[] DEFAULT '{}',

  -- Safety section (dos, donts, triggers, warnings)
  safety JSONB DEFAULT '{}'::jsonb,
  safety_notes TEXT,
  safety_updated_at TIMESTAMPTZ,
  safety_redacted_fields TEXT[] DEFAULT '{}',

  -- Contacts section (pediatrician, emergency contacts, authorized pickup)
  contacts JSONB DEFAULT '{}'::jsonb,
  contacts_notes TEXT,
  contacts_updated_at TIMESTAMPTZ,
  contacts_redacted_fields TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(child_id)
);

-- =============================================
-- FAMILY CARE INFO
-- Stores family-wide information
-- =============================================
CREATE TABLE IF NOT EXISTS family_care_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,

  -- Home base section (address, wifi, door codes, parking)
  home_base JSONB DEFAULT '{}'::jsonb,
  home_base_notes TEXT,
  home_base_updated_at TIMESTAMPTZ,
  home_base_redacted_fields TEXT[] DEFAULT '{}',

  -- House rules section (screens, snacks, pets, visitors)
  house_rules JSONB DEFAULT '{}'::jsonb,
  house_rules_notes TEXT,
  house_rules_updated_at TIMESTAMPTZ,
  house_rules_redacted_fields TEXT[] DEFAULT '{}',

  -- Schedule section (school hours, activities, pickup times)
  schedule JSONB DEFAULT '{}'::jsonb,
  schedule_notes TEXT,
  schedule_updated_at TIMESTAMPTZ,
  schedule_redacted_fields TEXT[] DEFAULT '{}',

  -- Emergency section (plan, nearest hospital, insurance info)
  emergency JSONB DEFAULT '{}'::jsonb,
  emergency_notes TEXT,
  emergency_updated_at TIMESTAMPTZ,
  emergency_redacted_fields TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(family_id)
);

-- =============================================
-- CARE INFO VERSIONS
-- Track changes for undo functionality (last 5 changes per section)
-- =============================================
CREATE TABLE IF NOT EXISTS care_info_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  info_id UUID NOT NULL,
  info_type TEXT NOT NULL CHECK (info_type IN ('child', 'family')),
  section TEXT NOT NULL,
  previous_data JSONB,
  previous_notes TEXT,
  previous_redacted_fields TEXT[],
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_care_info_versions_lookup ON care_info_versions(info_id, info_type, section, changed_at DESC);

-- =============================================
-- CARE GUIDES
-- Generated guides (immutable versions)
-- =============================================
CREATE TABLE IF NOT EXISTS care_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_ids UUID[] NOT NULL DEFAULT '{}',

  type TEXT NOT NULL CHECK (type IN ('child', 'family', 'babysitter', 'school', 'grandparent')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  template_version INTEGER DEFAULT 1,

  -- Source tracking
  source_info_ids UUID[],
  generated_at TIMESTAMPTZ DEFAULT NOW(),

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Version chain
  previous_version_id UUID REFERENCES care_guides(id),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_care_guides_family ON care_guides(family_id, created_at DESC);
CREATE INDEX idx_care_guides_type ON care_guides(type);

-- =============================================
-- GUIDE SHARES
-- Shareable links with access control
-- =============================================
CREATE TABLE IF NOT EXISTS guide_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
  token UUID UNIQUE DEFAULT gen_random_uuid(),

  -- Access control
  viewer_role TEXT CHECK (viewer_role IN ('babysitter', 'teacher', 'family', 'grandparent', 'other')),
  passcode_hash TEXT,
  requires_passcode BOOLEAN DEFAULT false,

  -- Expiration
  expires_at TIMESTAMPTZ,
  auto_expire_after_views INTEGER,

  -- Scope and permissions
  included_sections TEXT[] DEFAULT '{}',
  redacted_fields JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  share_name TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ
);

CREATE INDEX idx_guide_shares_token ON guide_shares(token) WHERE revoked_at IS NULL;
CREATE INDEX idx_guide_shares_guide ON guide_shares(guide_id);
CREATE INDEX idx_guide_shares_active ON guide_shares(created_by, created_at DESC) WHERE revoked_at IS NULL;

-- =============================================
-- GUIDE ACCESS LOGS
-- Track who viewed guides and when
-- =============================================
CREATE TABLE IF NOT EXISTS guide_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES guide_shares(id) ON DELETE CASCADE,

  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,

  -- What they did
  passcode_success BOOLEAN,
  sections_viewed TEXT[] DEFAULT '{}',
  items_marked_read TEXT[] DEFAULT '{}',

  -- Human readable summary
  summary TEXT
);

CREATE INDEX idx_guide_access_logs_share ON guide_access_logs(share_id, viewed_at DESC);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_child_care_info_updated_at
  BEFORE UPDATE ON child_care_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_care_info_updated_at
  BEFORE UPDATE ON family_care_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE child_care_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_care_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_info_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_access_logs ENABLE ROW LEVEL SECURITY;

-- Child care info policies
CREATE POLICY "Users can view child care info for their family's children"
  ON child_care_info FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = child_care_info.child_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert child care info for their family's children"
  ON child_care_info FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = child_care_info.child_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update child care info for their family's children"
  ON child_care_info FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = child_care_info.child_id
      AND fm.user_id = auth.uid()
    )
  );

-- Family care info policies
CREATE POLICY "Users can view their family's care info"
  ON family_care_info FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_care_info.family_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their family's care info"
  ON family_care_info FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_care_info.family_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their family's care info"
  ON family_care_info FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_care_info.family_id
      AND fm.user_id = auth.uid()
    )
  );

-- Care info versions policies
CREATE POLICY "Users can view versions for their family's info"
  ON care_info_versions FOR SELECT
  USING (
    (info_type = 'child' AND EXISTS (
      SELECT 1 FROM child_care_info cci
      JOIN children c ON c.id = cci.child_id
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE cci.id = care_info_versions.info_id
      AND fm.user_id = auth.uid()
    ))
    OR
    (info_type = 'family' AND EXISTS (
      SELECT 1 FROM family_care_info fci
      JOIN family_members fm ON fm.family_id = fci.family_id
      WHERE fci.id = care_info_versions.info_id
      AND fm.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert versions for their family's info"
  ON care_info_versions FOR INSERT
  WITH CHECK (
    (info_type = 'child' AND EXISTS (
      SELECT 1 FROM child_care_info cci
      JOIN children c ON c.id = cci.child_id
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE cci.id = care_info_versions.info_id
      AND fm.user_id = auth.uid()
    ))
    OR
    (info_type = 'family' AND EXISTS (
      SELECT 1 FROM family_care_info fci
      JOIN family_members fm ON fm.family_id = fci.family_id
      WHERE fci.id = care_info_versions.info_id
      AND fm.user_id = auth.uid()
    ))
  );

-- Care guides policies
CREATE POLICY "Users can view their family's guides"
  ON care_guides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = care_guides.family_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create guides for their family"
  ON care_guides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = care_guides.family_id
      AND fm.user_id = auth.uid()
    )
  );

-- Guide shares policies
CREATE POLICY "Users can view their own shares"
  ON guide_shares FOR SELECT
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM care_guides cg
      JOIN family_members fm ON fm.family_id = cg.family_id
      WHERE cg.id = guide_shares.guide_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for their family's guides"
  ON guide_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_guides cg
      JOIN family_members fm ON fm.family_id = cg.family_id
      WHERE cg.id = guide_shares.guide_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own shares"
  ON guide_shares FOR UPDATE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM care_guides cg
      JOIN family_members fm ON fm.family_id = cg.family_id
      WHERE cg.id = guide_shares.guide_id
      AND fm.user_id = auth.uid()
    )
  );

-- Access logs policies
CREATE POLICY "Users can view access logs for their shares"
  ON guide_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guide_shares gs
      WHERE gs.id = guide_access_logs.share_id
      AND (
        gs.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM care_guides cg
          JOIN family_members fm ON fm.family_id = cg.family_id
          WHERE cg.id = gs.guide_id
          AND fm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Anyone can insert access logs"
  ON guide_access_logs FOR INSERT
  WITH CHECK (true);
