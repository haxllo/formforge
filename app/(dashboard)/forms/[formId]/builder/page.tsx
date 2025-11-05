import { redirect } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/server';
import { BuilderClient } from '@/components/builder/BuilderClient';
import type { FormFieldDB } from '@/lib/types';

interface BuilderPageProps {
  params: Promise<{ formId: string }>;
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const { formId } = await params;
  const supabase = await createClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?redirect=/dashboard');
  }

  // Fetch form and fields
  const { data: formData, error } = await supabase
    .from('forms')
    .select('*, form_fields(*)')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single();

  if (error || !formData) {
    redirect('/dashboard');
  }

  // Verify ownership
  if (formData.user_id !== user.id) {
    redirect('/dashboard');
  }

  const fields: FormFieldDB[] = ((formData.form_fields || []) as FormFieldDB[]).sort(
    (a: FormFieldDB, b: FormFieldDB) => a.field_order - b.field_order
  );

  return (
    <BuilderClient
      formId={formId}
      initialForm={{
        id: formData.id,
        user_id: formData.user_id,
        title: formData.title,
        slug: formData.slug,
        status: formData.status,
        description: formData.description || undefined,
        created_at: formData.created_at,
        updated_at: formData.updated_at,
        settings: formData.settings || {},
      }}
      initialFields={fields}
    />
  );
}
