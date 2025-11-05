import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';
import { logError } from '@/lib/utils/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClientSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['draft', 'published'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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

    // If publishing, check if form has at least one field
    if (status === 'published') {
      const { data: fields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('id')
        .eq('form_id', id)
        .limit(1);

      if (fieldsError) {
        logError(fieldsError, 'PATCH /api/forms/[id]/publish - check fields');
      }

      if (!fields || fields.length === 0) {
        return NextResponse.json(
          { error: 'Cannot publish form without fields' },
          { status: 400 }
        );
      }
    }

    // Update status
    const { data: updatedForm, error: updateError } = await supabase
      .from('forms')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logError(updateError, 'PATCH /api/forms/[id]/publish');
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json(updatedForm);
  } catch (error) {
    logError(error, 'PATCH /api/forms/[id]/publish');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
