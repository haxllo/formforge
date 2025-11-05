import type { FieldType } from './types';

export const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Short Text', icon: 'Type' },
  { type: 'longtext', label: 'Long Text', icon: 'FileText' },
  { type: 'email', label: 'Email', icon: 'Mail' },
  { type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare' },
  { type: 'radio', label: 'Radio', icon: 'Circle' },
  { type: 'divider', label: 'Divider', icon: 'Minus' },
];

export const FORM_STATUS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
};

export const DEFAULT_FORM_SETTINGS = {
  thankYouMessage: 'Thank you for your submission!',
  allowMultipleSubmissions: true,
};
