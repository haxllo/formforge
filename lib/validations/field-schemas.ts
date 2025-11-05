import { z } from 'zod';
import type { FieldType } from '@/lib/types';

export const fieldTypeSchema = z.enum([
  'text',
  'email',
  'longtext',
  'checkbox',
  'radio',
  'divider',
]);

export const formFieldSchema = z.object({
  id: z.string(),
  dbId: z.string().optional(),
  type: fieldTypeSchema,
  label: z.string().min(1, 'Label is required').max(200),
  order: z.number().int().min(0),
  config: z.object({
    required: z.boolean().default(false),
    placeholder: z.string().max(200).optional(),
    options: z.array(z.string()).optional(),
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(1).optional(),
    pattern: z.string().optional(),
    helpText: z.string().max(500).optional(),
  }).default({ required: false }),
});

export const formFieldsSchema = z.array(formFieldSchema);
