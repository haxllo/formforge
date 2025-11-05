import { notFound } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/server';
import { PublicFormRenderer } from '@/components/public/PublicFormRenderer';
import type { Form, FormFieldDB } from '@/lib/types';

interface FormPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const { slug } = await params;
  const supabase = createClientSupabase();

  // Fetch form by slug
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('slug', slug)
    .single();

  if (formError || !form) {
    notFound();
  }

  // Check if form is published
  if (form.status !== 'published') {
    notFound();
  }

  // Fetch form fields
  const { data: fields, error: fieldsError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', form.id)
    .order('field_order', { ascending: true });

  if (fieldsError) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{form.title}</h1>
          {form.description && (
            <p className="mb-8 text-gray-600">{form.description}</p>
          )}
          <PublicFormRenderer
            form={form as Form}
            fields={(fields || []) as FormFieldDB[]}
          />
        </div>
      </div>
    </div>
  );
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds
