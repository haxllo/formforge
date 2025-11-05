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

export type FormTheme = 'default' | 'minimal' | 'modern' | 'playful' | 'professional' | 'custom';

export type FormLayout = 'single' | 'two-column' | 'card';

export interface ThemeConfig {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  buttonStyle?: 'rounded' | 'square' | 'pill';
  backgroundImage?: string;
  customCSS?: string;
}

export interface FormSettings {
  thankYouMessage?: string;
  redirectUrl?: string;
  allowMultipleSubmissions?: boolean;
  webhookUrl?: string;
  webhookEnabled?: boolean;
  enableHoneypot?: boolean;
  recaptchaEnabled?: boolean;
  recaptchaSiteKey?: string;
  theme?: FormTheme;
  themeConfig?: ThemeConfig;
  layout?: FormLayout;
  showProgressBar?: boolean;
  removeBranding?: boolean;
  customDomain?: string;
  logoUrl?: string;
  [key: string]: unknown;
}

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'longtext' 
  | 'checkbox' 
  | 'radio' 
  | 'divider'
  | 'number'
  | 'date'
  | 'file'
  | 'dropdown'
  | 'rating'
  | 'phone'
  | 'url'
  | 'matrix'
  | 'ranking'
  | 'picture_choice'
  | 'signature'
  | 'page_break';

export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';

export interface FieldCondition {
  fieldId: string; // ID of the field to check
  operator: ConditionOperator;
  value?: string | number; // Value to compare against
}

export interface FormFieldConfig {
  required: boolean;
  placeholder?: string;
  options?: string[]; // For radio/checkbox
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  helpText?: string;
  condition?: FieldCondition; // Show this field only if condition is met
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
