import type { FieldType } from './types';

export const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Short Text', icon: 'Type' },
  { type: 'longtext', label: 'Long Text', icon: 'FileText' },
  { type: 'email', label: 'Email', icon: 'Mail' },
  { type: 'number', label: 'Number', icon: 'Type' },
  { type: 'phone', label: 'Phone', icon: 'Type' },
  { type: 'url', label: 'URL', icon: 'Type' },
  { type: 'date', label: 'Date', icon: 'Type' },
  { type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare' },
  { type: 'radio', label: 'Radio', icon: 'Circle' },
  { type: 'dropdown', label: 'Dropdown', icon: 'Type' },
  { type: 'rating', label: 'Rating', icon: 'Type' },
  { type: 'file', label: 'File Upload', icon: 'FileText' },
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
