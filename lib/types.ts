export type FormStatus = 'draft' | 'published';

export interface Form {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  status: FormStatus;
  description?: string;
  created_at: string;
  updated_at: string;
  settings: FormSettings;
}

export interface FormSettings {
  thankYouMessage?: string;
  redirectUrl?: string;
  allowMultipleSubmissions?: boolean;
  [key: string]: unknown;
}

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'longtext' 
  | 'checkbox' 
  | 'radio' 
  | 'divider';

export interface FormFieldConfig {
  required: boolean;
  placeholder?: string;
  options?: string[]; // For radio/checkbox
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  helpText?: string;
  [key: string]: unknown;
}

export interface FormField {
  id: string; // Client-side temp ID
  dbId?: string; // Database ID once saved
  type: FieldType;
  label: string;
  order: number;
  config: FormFieldConfig;
}

export interface FormFieldDB {
  id: string;
  form_id: string;
  field_type: FieldType;
  label: string;
  placeholder?: string;
  is_required: boolean;
  field_order: number;
  config: FormFieldConfig;
}

export interface Submission {
  id: string;
  form_id: string;
  submitted_at: string;
  data: Record<string, unknown>;
}

export interface FormWithFields extends Form {
  fields: FormFieldDB[];
}
