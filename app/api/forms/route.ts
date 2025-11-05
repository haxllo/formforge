import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';
import { createFormSchema } from '@/lib/validations/form-schemas';
import { slugify, generateUniqueSlug } from '@/lib/utils/slugify';
import { sanitizeText } from '@/lib/utils/sanitize';
import { logError } from '@/lib/utils/logger';

export async function GET() {
  try {
    const supabase = createClientSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: forms, error } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logError(error, 'GET /api/forms');
      return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
    }

    return NextResponse.json(forms);
  } catch (error) {
    logError(error, 'GET /api/forms');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createFormSchema.parse(body);

    // Generate unique slug
    const baseSlug = slugify(validated.title || 'untitled-form');
    let slug = baseSlug;

    // Check if slug exists and generate unique one
    const { data: existing } = await supabase
      .from('forms')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = generateUniqueSlug(baseSlug);
    }

    const { data: form, error } = await supabase
      .from('forms')
      .insert({
        user_id: user.id,
        title: sanitizeText(validated.title),
        slug,
        description: validated.description ? sanitizeText(validated.description) : null,
        status: 'draft',
        settings: {},
      })
      .select()
      .single();

    if (error) {
      logError(error, 'POST /api/forms');
      return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: error }, { status: 400 });
    }
    logError(error, 'POST /api/forms');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
