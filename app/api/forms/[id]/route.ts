import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';
import { updateFormSchema } from '@/lib/validations/form-schemas';
import { formFieldsSchema } from '@/lib/validations/field-schemas';
import { sanitizeText } from '@/lib/utils/sanitize';
import { logError } from '@/lib/utils/logger';
import type { FormField, FormFieldDB } from '@/lib/types';

export async function GET(
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

    // Fetch form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Fetch form fields
    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', id)
      .order('field_order', { ascending: true });

    if (fieldsError) {
      logError(fieldsError, 'GET /api/forms/[id] - fields');
    }

    return NextResponse.json({
      form,
      fields: fields || [],
    });
  } catch (error) {
    logError(error, 'GET /api/forms/[id]');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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

    // Verify ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const body = await request.json();
    const { fields, ...formData } = body;

    // Update form metadata if provided
    if (Object.keys(formData).length > 0) {
      const validated = updateFormSchema.parse(formData);
      const updateData: Record<string, unknown> = {};

      if (validated.title) {
        updateData.title = sanitizeText(validated.title);
      }
      if (validated.description !== undefined) {
        updateData.description = validated.description ? sanitizeText(validated.description) : null;
      }
      if (validated.status) {
        updateData.status = validated.status;
      }
      if (validated.settings) {
        // Merge with existing settings to preserve other fields
        const { data: currentForm } = await supabase
          .from('forms')
          .select('settings')
          .eq('id', id)
          .single();
        
        updateData.settings = {
          ...(currentForm?.settings || {}),
          ...validated.settings,
        };
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('forms')
          .update(updateData)
          .eq('id', id);

        if (updateError) {
          logError(updateError, 'PUT /api/forms/[id] - update form');
        }
      }
    }

    // Update fields if provided
    if (fields && Array.isArray(fields)) {
      const validatedFields = formFieldsSchema.parse(fields);

      // Delete existing fields
      const { error: deleteError } = await supabase
        .from('form_fields')
        .delete()
        .eq('form_id', id);

      if (deleteError) {
        logError(deleteError, 'PUT /api/forms/[id] - delete fields');
      }

      // Insert new fields
      if (validatedFields.length > 0) {
        const fieldsToInsert: Omit<FormFieldDB, 'id'>[] = validatedFields.map((field: FormField) => ({
          form_id: id,
          field_type: field.type,
          label: sanitizeText(field.label),
          placeholder: field.config.placeholder ? sanitizeText(field.config.placeholder) : null,
          is_required: field.config.required || false,
          field_order: field.order,
          config: field.config,
        }));

        const { error: insertError } = await supabase
          .from('form_fields')
          .insert(fieldsToInsert);

        if (insertError) {
          logError(insertError, 'PUT /api/forms/[id] - insert fields');
          return NextResponse.json({ error: 'Failed to update fields' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, formId: id });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: error }, { status: 400 });
    }
    logError(error, 'PUT /api/forms/[id]');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Verify ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Delete form (cascade will delete fields and submissions)
    const { error: deleteError } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logError(deleteError, 'DELETE /api/forms/[id]');
      return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'DELETE /api/forms/[id]');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
