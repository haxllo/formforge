import { z } from 'zod';
import type { FormFieldDB } from '@/lib/types';

export function createSubmissionSchema(fields: FormFieldDB[]) {
  const schema: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    if (field.field_type === 'divider') return;

    let fieldSchema: z.ZodTypeAny;

    switch (field.field_type) {
      case 'email':
        fieldSchema = z.string().email('Invalid email address');
        break;
      case 'longtext':
        fieldSchema = z.string();
        break;
      case 'checkbox':
        fieldSchema = field.is_required
          ? z.array(z.string()).min(1, `${field.label} is required`)
          : z.array(z.string()).optional();
        break;
      case 'radio':
        fieldSchema = z.string();
        break;
      default:
        fieldSchema = z.string();
    }

    if (field.is_required && field.field_type !== 'checkbox') {
      fieldSchema = fieldSchema.refine((val) => val && val.length > 0, {
        message: `${field.label} is required`,
      });
    }

    // Use label as key for now (could be improved with field IDs)
    const key = field.label.toLowerCase().replace(/\s+/g, '_');
    schema[key] = fieldSchema;
  });

  return z.object(schema);
}
