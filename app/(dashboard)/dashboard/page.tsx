import { createClientSupabase } from '@/lib/supabase/server';
import { FormCard } from '@/components/dashboard/FormCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { Form } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: forms, error } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const formsList: Form[] = forms || [];

  // Calculate stats
  const totalForms = formsList.length;
  const publishedForms = formsList.filter((f) => f.status === 'published').length;

  // Get submission counts
  const { data: submissions } = await supabase
    .from('submissions')
    .select('form_id')
    .in(
      'form_id',
      formsList.map((f) => f.id)
    );

  const submissionCounts = new Map<string, number>();
  submissions?.forEach((s) => {
    submissionCounts.set(s.form_id, (submissionCounts.get(s.form_id) || 0) + 1);
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage your forms
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-600">Total Forms</div>
          <div className="mt-2 text-3xl font-bold">{totalForms}</div>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-600">Published</div>
          <div className="mt-2 text-3xl font-bold">{publishedForms}</div>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-600">Total Submissions</div>
          <div className="mt-2 text-3xl font-bold">
            {submissions?.length || 0}
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      {formsList.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No forms yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get started by creating your first form
          </p>
          <Link href="/dashboard/new">
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {formsList.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              submissionCount={submissionCounts.get(form.id) || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
