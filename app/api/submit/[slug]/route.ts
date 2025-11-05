import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';
import { createSubmissionSchema } from '@/lib/validations/submission-schemas';
import { sanitizeText, sanitizeHtml } from '@/lib/utils/sanitize';
import { logError } from '@/lib/utils/logger';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // 10 submissions per hour per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = await createClientSupabase();

    // Fetch form by slug
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, status')
      .eq('slug', slug)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (form.status !== 'published') {
      return NextResponse.json({ error: 'Form is not published' }, { status: 403 });
    }

    // Fetch form fields
    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', form.id)
      .order('field_order', { ascending: true });

    if (fieldsError || !fields || fields.length === 0) {
      return NextResponse.json({ error: 'Form has no fields' }, { status: 400 });
    }

    // Validate submission data
    const body = await request.json();
    const schema = createSubmissionSchema(fields);

    try {
      const validated = schema.parse(body);

      // Sanitize submission data
      const sanitizedData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(validated)) {
        if (typeof value === 'string') {
          sanitizedData[key] = sanitizeText(value);
        } else if (Array.isArray(value)) {
          sanitizedData[key] = value.map((v) =>
            typeof v === 'string' ? sanitizeText(v) : v
          );
        } else {
          sanitizedData[key] = value;
        }
      }

      // Insert submission
      const { data: submission, error: insertError } = await supabase
        .from('submissions')
        .insert({
          form_id: form.id,
          data: sanitizedData,
        })
        .select()
        .single();

      if (insertError) {
        logError(insertError, 'POST /api/submit/[slug]');
        return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Submission received',
        submissionId: submission.id,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Validation failed', details: error },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    logError(error, 'POST /api/submit/[slug]');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
