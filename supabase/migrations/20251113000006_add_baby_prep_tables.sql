-- Create baby_prep_lists table
CREATE TABLE IF NOT EXISTS baby_prep_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  due_date DATE,
  stage TEXT CHECK (stage IN ('first', 'second', 'third', 'fourth')),
  is_second_child BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create baby_prep_tasks table
CREATE TABLE IF NOT EXISTS baby_prep_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES baby_prep_lists(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('essentials', 'family_home', 'money_admin', 'emotional_community', 'name_ideas')),
  title TEXT NOT NULL,
  description TEXT,
  is_complete BOOLEAN DEFAULT FALSE,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create baby_name_ideas table
CREATE TABLE IF NOT EXISTS baby_name_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('F', 'M', 'N')) DEFAULT 'N',
  notes TEXT,
  ai_enhanced_notes JSONB DEFAULT '{}',
  reactions JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create baby_name_comments table
CREATE TABLE IF NOT EXISTS baby_name_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_id UUID NOT NULL REFERENCES baby_name_ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS baby_prep_lists_family_id_idx ON baby_prep_lists(family_id);
CREATE INDEX IF NOT EXISTS baby_prep_tasks_list_id_idx ON baby_prep_tasks(list_id);
CREATE INDEX IF NOT EXISTS baby_prep_tasks_category_idx ON baby_prep_tasks(category);
CREATE INDEX IF NOT EXISTS baby_name_ideas_family_id_idx ON baby_name_ideas(family_id);
CREATE INDEX IF NOT EXISTS baby_name_comments_name_id_idx ON baby_name_comments(name_id);

-- Enable RLS
ALTER TABLE baby_prep_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_prep_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_name_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_name_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for baby_prep_lists
CREATE POLICY "Users can view baby prep lists for their family"
  ON baby_prep_lists FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create baby prep lists for their family"
  ON baby_prep_lists FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update baby prep lists for their family"
  ON baby_prep_lists FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete baby prep lists for their family"
  ON baby_prep_lists FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for baby_prep_tasks
CREATE POLICY "Users can view baby prep tasks for their family"
  ON baby_prep_tasks FOR SELECT
  USING (
    list_id IN (
      SELECT id FROM baby_prep_lists WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create baby prep tasks for their family"
  ON baby_prep_tasks FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT id FROM baby_prep_lists WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update baby prep tasks for their family"
  ON baby_prep_tasks FOR UPDATE
  USING (
    list_id IN (
      SELECT id FROM baby_prep_lists WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete baby prep tasks for their family"
  ON baby_prep_tasks FOR DELETE
  USING (
    list_id IN (
      SELECT id FROM baby_prep_lists WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for baby_name_ideas
CREATE POLICY "Users can view baby name ideas for their family"
  ON baby_name_ideas FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create baby name ideas for their family"
  ON baby_name_ideas FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update baby name ideas for their family"
  ON baby_name_ideas FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete baby name ideas for their family"
  ON baby_name_ideas FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for baby_name_comments
CREATE POLICY "Users can view baby name comments for their family"
  ON baby_name_comments FOR SELECT
  USING (
    name_id IN (
      SELECT id FROM baby_name_ideas WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create baby name comments for their family"
  ON baby_name_comments FOR INSERT
  WITH CHECK (
    name_id IN (
      SELECT id FROM baby_name_ideas WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own baby name comments"
  ON baby_name_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own baby name comments"
  ON baby_name_comments FOR DELETE
  USING (user_id = auth.uid());
