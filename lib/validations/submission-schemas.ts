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
      case 'number':
        fieldSchema = z.union([z.number(), z.string()]).transform((val) => {
          if (typeof val === 'string') {
            const num = Number(val);
            if (isNaN(num)) {
              throw new z.ZodError([{
                code: 'custom',
                message: 'Please enter a valid number',
                path: [],
              }]);
            }
            return num;
          }
          return val;
        }).pipe(z.number());
        const minValue = typeof field.config?.min === 'number' ? field.config.min : undefined;
        const maxValue = typeof field.config?.max === 'number' ? field.config.max : undefined;
        if (minValue !== undefined) {
          fieldSchema = fieldSchema.refine((val) => (val as number) >= minValue, {
            message: `Value must be at least ${minValue}`,
          });
        }
        if (maxValue !== undefined) {
          fieldSchema = fieldSchema.refine((val) => (val as number) <= maxValue, {
            message: `Value must be at most ${maxValue}`,
          });
        }
        break;
      case 'date':
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format');
        break;
      case 'phone':
        fieldSchema = z.string().regex(/^[\d\s\+\-\(\)]+$/, 'Invalid phone number format');
        break;
      case 'url':
        fieldSchema = z.string().url('Invalid URL format');
        break;
      case 'dropdown':
        fieldSchema = z.string();
        break;
      case 'rating':
        const maxRating = typeof field.config?.maxRating === 'number' ? field.config.maxRating : 5;
        fieldSchema = z.union([z.number(), z.string()]).transform((val) => {
          if (typeof val === 'string') {
            const num = Number(val);
            return isNaN(num) ? 0 : num;
          }
          return val;
        }).pipe(z.number().int().min(1).max(maxRating));
        break;
      case 'file':
        fieldSchema = z.any().optional(); // File handling will be done separately
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

    if (field.is_required && field.field_type !== 'checkbox' && field.field_type !== 'file') {
      if (field.field_type === 'number' || field.field_type === 'rating') {
        // Number fields are already validated
      } else {
        fieldSchema = fieldSchema.refine((val) => {
          if (typeof val === 'string') {
            return val.length > 0;
          }
          return val !== null && val !== undefined;
        }, {
          message: `${field.label} is required`,
        });
      }
    } else if (!field.is_required && field.field_type !== 'checkbox' && field.field_type !== 'file') {
      // Make optional if not required
      fieldSchema = fieldSchema.optional();
    }

    // Use label as key for now (could be improved with field IDs)
    const key = field.label.toLowerCase().replace(/\s+/g, '_');
    schema[key] = fieldSchema;
  });

  return z.object(schema);
}
