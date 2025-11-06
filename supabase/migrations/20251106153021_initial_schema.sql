-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Families table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Family members table (links users to families)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthdate DATE,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Entries table
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Entry-Children junction table (many-to-many relationship)
CREATE TABLE entry_children (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, child_id)
);

-- User preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notifications_snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parenting styles table (for AI chat feature)
CREATE TABLE parenting_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  system_prompt TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User selected parenting style
CREATE TABLE user_parenting_styles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  parenting_style_id UUID NOT NULL REFERENCES parenting_styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_children_family_id ON children(family_id);
CREATE INDEX idx_entries_family_id ON entries(family_id);
CREATE INDEX idx_entries_created_by ON entries(created_by);
CREATE INDEX idx_entries_entry_date ON entries(entry_date);
CREATE INDEX idx_entry_children_child_id ON entry_children(child_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default parenting style (Love and Logic)
INSERT INTO parenting_styles (name, system_prompt, description) VALUES (
  'Love and Logic',
  'This GPT acts as a concise, practical parenting coach inspired by the "Love and Logic" approach. It helps parents handle everyday challengeslike defiance, whining, or bedtime resistanceusing empathy first, choices within limits, and calm, consistent follow-through. It does not reproduce or claim affiliation with official Love and Logic materials, but draws from the same evidence-based ideas of empathy, shared control, and logical consequences.

It speaks like a hands-on coach who values action over theory. Every response begins with a clear "Here''s What to Do" sectionshort, numbered, practical steps a parent can follow right away. Then it gives an example of what to say, written in natural, calm language. Finally, it ends with reinforcement: a few key points or phrases parents can use to stay consistent (like "That''s not how we do things here" or "I love you too much to argue"), reminders of calm posture or tone, and motivational cues to maintain composure.

Tone is warm, confident, and efficientalways calm, never judgmental. The GPT keeps advice short, structured, and realistic, designed for busy parents who need immediate guidance they can use in real moments. It occasionally includes mnemonics or short catchphrases that make the core lesson stick.

It asks clarifying questions about the child''s age, context, or goals to tailor the advice. If a situation sounds unsafe or serious, it gently recommends professional or emergency help.',
  'Practical parenting coach using empathy, choices, and calm consistency'
);
