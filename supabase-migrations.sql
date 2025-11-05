-- FormForge Enhanced Features Migration
-- Optional: Add these tables for advanced features

-- 1. Analytics/Views Table (for tracking form views and analytics)
CREATE TABLE IF NOT EXISTS form_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'start', 'complete', 'abandon')),
    page_number INTEGER DEFAULT 1,
    field_id UUID,
    ip_address INET,
    user_agent TEXT,
    country TEXT,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_form_analytics_form_id ON form_analytics(form_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_event_type ON form_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_form_analytics_created_at ON form_analytics(created_at);

ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form owners can view analytics." ON form_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM forms WHERE forms.id = form_analytics.form_id AND forms.user_id = auth.uid())
  );

CREATE POLICY "Anonymous users can insert analytics." ON form_analytics
  FOR INSERT WITH CHECK (true);

-- 2. Workspaces Table (for team collaboration)
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace owners can manage their workspaces." ON workspaces
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- 3. Workspace Members Table
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'editor', 'viewer')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(workspace_id, user_id)
);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view their memberships." ON workspace_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid())
  );

-- 4. Form Templates Table
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    thumbnail_url TEXT,
    template_data JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_form_templates_category ON form_templates(category);
CREATE INDEX IF NOT EXISTS idx_form_templates_public ON form_templates(is_public);

ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates and their own." ON form_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates." ON form_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Add workspace_id to forms table (optional, for multi-workspace support)
ALTER TABLE forms ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_forms_workspace_id ON forms(workspace_id);

-- 6. Submission Status Table (for tracking submission workflow)
CREATE TABLE IF NOT EXISTS submission_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'archived', 'spam')),
    notes TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submission_status_submission_id ON submission_status(submission_id);

ALTER TABLE submission_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form owners can manage submission status." ON submission_status
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM submissions 
      JOIN forms ON forms.id = submissions.form_id 
      WHERE submissions.id = submission_status.submission_id 
      AND forms.user_id = auth.uid()
    )
  );
