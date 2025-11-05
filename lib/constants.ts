import type { FieldType } from './types';

export const FIELD_TYPES: { type: FieldType; label: string; icon: string; category: string }[] = [
  { type: 'text', label: 'Short Text', icon: 'Type', category: 'basic' },
  { type: 'longtext', label: 'Long Text', icon: 'FileText', category: 'basic' },
  { type: 'email', label: 'Email', icon: 'Mail', category: 'basic' },
  { type: 'number', label: 'Number', icon: 'Hash', category: 'basic' },
  { type: 'phone', label: 'Phone', icon: 'Phone', category: 'basic' },
  { type: 'url', label: 'URL', icon: 'Link', category: 'basic' },
  { type: 'date', label: 'Date', icon: 'Calendar', category: 'basic' },
  { type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare', category: 'choice' },
  { type: 'radio', label: 'Radio', icon: 'Circle', category: 'choice' },
  { type: 'dropdown', label: 'Dropdown', icon: 'List', category: 'choice' },
  { type: 'rating', label: 'Rating', icon: 'Star', category: 'choice' },
  { type: 'matrix', label: 'Matrix', icon: 'Grid3x3', category: 'advanced' },
  { type: 'ranking', label: 'Ranking', icon: 'ArrowUpDown', category: 'advanced' },
  { type: 'picture_choice', label: 'Picture Choice', icon: 'Image', category: 'advanced' },
  { type: 'signature', label: 'Signature', icon: 'PenTool', category: 'advanced' },
  { type: 'file', label: 'File Upload', icon: 'Upload', category: 'basic' },
  { type: 'page_break', label: 'Page Break', icon: 'Divide', category: 'layout' },
  { type: 'divider', label: 'Divider', icon: 'Minus', category: 'layout' },
];

export const FORM_STATUS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
};

export const DEFAULT_FORM_SETTINGS = {
  thankYouMessage: 'Thank you for your submission!',
  allowMultipleSubmissions: true,
};
