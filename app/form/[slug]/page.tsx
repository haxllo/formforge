import { notFound } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/server';
import { PublicFormRenderer } from '@/components/public/PublicFormRenderer';
import type { Form, FormFieldDB } from '@/lib/types';
import { getThemeStyles } from '@/lib/themes';

interface FormPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const { slug } = await params;
  const supabase = await createClientSupabase();

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

  const formData = form as Form;
  const layout = formData.settings?.layout || 'single';
  const showLogo = formData.settings?.logoUrl;
  const removeBranding = formData.settings?.removeBranding;
  
  const themeStyles = getThemeStyles(
    formData.settings?.theme as string || 'default',
    formData.settings?.themeConfig as Record<string, unknown>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      <div className="form-container min-h-screen bg-gray-50 py-12 px-4">
        <div className={`mx-auto ${layout === 'two-column' ? 'max-w-5xl' : 'max-w-2xl'}`}>
          <div className={`rounded-lg bg-white p-8 shadow-sm ${layout === 'card' ? 'border-2' : ''}`}>
          {showLogo && (
            <div className="mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={showLogo as string} alt="Logo" className="h-12 object-contain" />
            </div>
          )}
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{form.title}</h1>
          {form.description && (
            <p className="mb-8 text-gray-600">{form.description}</p>
          )}
          <PublicFormRenderer
            form={formData}
            fields={(fields || []) as FormFieldDB[]}
          />
          {!removeBranding && (
            <div className="mt-8 text-center text-xs text-gray-400">
              Powered by <a href="https://formforge.com" className="hover:text-gray-600">FormForge</a>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds
