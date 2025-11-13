-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  due_date DATE,
  category TEXT, -- 'Shopping', 'School', 'Health', 'Home', 'Other'
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  linked_need_id UUID, -- Future: link to a specific need/item
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_todo_list BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminder_subtasks table for multi-step to-dos
CREATE TABLE IF NOT EXISTS reminder_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX reminders_family_id_idx ON reminders(family_id);
CREATE INDEX reminders_assigned_to_idx ON reminders(assigned_to);
CREATE INDEX reminders_due_date_idx ON reminders(due_date);
CREATE INDEX reminders_is_completed_idx ON reminders(is_completed);
CREATE INDEX reminder_subtasks_reminder_id_idx ON reminder_subtasks(reminder_id);

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_subtasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reminders
CREATE POLICY "Users can view reminders in their family"
  ON reminders FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reminders in their family"
  ON reminders FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reminders in their family"
  ON reminders FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reminders in their family"
  ON reminders FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for reminder_subtasks
CREATE POLICY "Users can view subtasks for reminders in their family"
  ON reminder_subtasks FOR SELECT
  USING (
    reminder_id IN (
      SELECT id FROM reminders WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create subtasks for reminders in their family"
  ON reminder_subtasks FOR INSERT
  WITH CHECK (
    reminder_id IN (
      SELECT id FROM reminders WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update subtasks for reminders in their family"
  ON reminder_subtasks FOR UPDATE
  USING (
    reminder_id IN (
      SELECT id FROM reminders WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete subtasks for reminders in their family"
  ON reminder_subtasks FOR DELETE
  USING (
    reminder_id IN (
      SELECT id FROM reminders WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_reminders_updated_at();
