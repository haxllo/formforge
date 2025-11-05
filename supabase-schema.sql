-- FormForge Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Forms Table
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Form',
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb
);

-- RLS Policy for Forms
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own forms." ON forms
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Form Fields Table
CREATE TABLE IF NOT EXISTS form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    field_type TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    field_order INTEGER NOT NULL,
    config JSONB DEFAULT '{}'::jsonb
);

-- RLS Policy for Form Fields
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage fields belonging to their forms." ON form_fields
  FOR ALL USING (
    EXISTS (SELECT 1 FROM forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid())
  );

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    data JSONB NOT NULL
);

-- RLS Policy for Submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form owners can view submissions." ON submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM forms WHERE forms.id = submissions.form_id AND forms.user_id = auth.uid())
  );

CREATE POLICY "Anonymous users can insert submissions." ON submissions
  FOR INSERT WITH CHECK (true);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);

-- 5. Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger for forms table
DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
CREATE TRIGGER update_forms_updated_at 
    BEFORE UPDATE ON forms
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
