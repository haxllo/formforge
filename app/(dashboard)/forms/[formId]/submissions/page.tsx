import { redirect } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/server';
import { SubmissionTable } from '@/components/dashboard/SubmissionTable';
import type { Submission } from '@/lib/types';

interface SubmissionsPageProps {
  params: Promise<{ formId: string }>;
}

export default async function SubmissionsPage({ params }: SubmissionsPageProps) {
  const { formId } = await params;
  const supabase = await createClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?redirect=/dashboard');
  }

  // Verify ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, title')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    redirect('/dashboard');
  }

  // Fetch submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false });

  // Fetch form fields to understand submission structure
  const { data: fields } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('field_order', { ascending: true });

  // Calculate stats
  const totalSubmissions = submissions?.length || 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySubmissions = submissions?.filter(
    (s) => new Date(s.submitted_at) >= today
  ).length || 0;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSubmissions = submissions?.filter(
    (s) => new Date(s.submitted_at) >= weekAgo
  ).length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
        <p className="mt-2 text-sm text-gray-600">View and manage form submissions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-600">Total Submissions</div>
          <div className="mt-2 text-3xl font-bold">{totalSubmissions}</div>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-600">Today</div>
          <div className="mt-2 text-3xl font-bold">{todaySubmissions}</div>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-600">Last 7 Days</div>
          <div className="mt-2 text-3xl font-bold">{weekSubmissions}</div>
        </div>
      </div>

      {/* Submissions Table */}
      <SubmissionTable
        submissions={(submissions || []) as Submission[]}
        fields={fields || []}
      />
    </div>
  );
}
