import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';
import { generateUniqueSlug } from '@/lib/utils/slugify';
import { sanitizeText } from '@/lib/utils/sanitize';
import { logError } from '@/lib/utils/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClientSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch original form
    const { data: originalForm, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (formError || !originalForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Fetch original fields
    const { data: originalFields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', id)
      .order('field_order', { ascending: true });

    if (fieldsError) {
      logError(fieldsError, 'POST /api/forms/[id]/duplicate - fetch fields');
    }

    // Create new form
    const newSlug = generateUniqueSlug(`${originalForm.slug}-copy`);
    const { data: newForm, error: createError } = await supabase
      .from('forms')
      .insert({
        user_id: user.id,
        title: `${sanitizeText(originalForm.title)} (Copy)`,
        slug: newSlug,
        description: originalForm.description ? sanitizeText(originalForm.description) : null,
        status: 'draft',
        settings: originalForm.settings || {},
      })
      .select()
      .single();

    if (createError || !newForm) {
      logError(createError, 'POST /api/forms/[id]/duplicate - create form');
      return NextResponse.json({ error: 'Failed to duplicate form' }, { status: 500 });
    }

    // Duplicate fields
    if (originalFields && originalFields.length > 0) {
      const fieldsToInsert = originalFields.map((field) => ({
        form_id: newForm.id,
        field_type: field.field_type,
        label: sanitizeText(field.label),
        placeholder: field.placeholder ? sanitizeText(field.placeholder) : null,
        is_required: field.is_required,
        field_order: field.field_order,
        config: field.config,
      }));

      const { error: fieldsInsertError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);

      if (fieldsInsertError) {
        logError(fieldsInsertError, 'POST /api/forms/[id]/duplicate - insert fields');
        // Form is created, but fields failed - still return success
      }
    }

    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    logError(error, 'POST /api/forms/[id]/duplicate');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
