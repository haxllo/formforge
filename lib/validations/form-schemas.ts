import { z } from 'zod';

export const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
});

export const updateFormSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['draft', 'published']).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});
