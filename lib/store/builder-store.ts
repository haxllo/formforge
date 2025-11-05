import { create } from 'zustand';
import type { FormField, FieldType } from '@/lib/types';

interface BuilderState {
  fields: FormField[];
  selectedFieldId: string | null;
  formTitle: string;
  formDescription?: string;
  formSettings: {
    thankYouMessage?: string;
    redirectUrl?: string;
    webhookUrl?: string;
    webhookEnabled?: boolean;
    enableHoneypot?: boolean;
    theme?: string;
    layout?: string;
    showProgressBar?: boolean;
    removeBranding?: boolean;
  };
  isPreviewMode: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  
  // Actions
  setFields: (fields: FormField[]) => void;
  addField: (type: FieldType, order?: number) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  selectField: (id: string | null) => void;
  setFormTitle: (title: string) => void;
  setFormDescription: (description: string | undefined) => void;
  setFormSettings: (settings: Partial<BuilderState['formSettings']>) => void;
  togglePreviewMode: () => void;
  markSaved: () => void;
  markUnsaved: () => void;
  reset: () => void;
}

const initialState = {
  fields: [],
  selectedFieldId: null,
  formTitle: 'Untitled Form',
  formDescription: '',
  formSettings: {
    thankYouMessage: 'Thank you for your submission!',
    webhookEnabled: false,
  },
  isPreviewMode: false,
  lastSaved: null,
  hasUnsavedChanges: false,
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  ...initialState,

  setFields: (fields) => {
    set({ fields, hasUnsavedChanges: true });
  },

  addField: (type, order) => {
    const fields = get().fields;
    const newOrder = order !== undefined ? order : fields.length;
    const defaultConfig: FormField['config'] = {
      required: false,
    };
    
    if (type === 'radio' || type === 'checkbox' || type === 'dropdown') {
      defaultConfig.options = ['Option 1'];
    }
    if (type === 'rating') {
      defaultConfig.maxRating = 5;
    }
    if (type === 'matrix') {
      defaultConfig.rows = ['Row 1'];
      defaultConfig.columns = ['Column 1'];
    }
    if (type === 'ranking') {
      defaultConfig.options = ['Option 1', 'Option 2', 'Option 3'];
    }
    if (type === 'picture_choice') {
      defaultConfig.options = [];
      defaultConfig.imageUrls = [];
    }
    
    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      label: getDefaultLabel(type),
      order: newOrder,
      config: defaultConfig,
    };

    // Adjust order of existing fields if needed
    const adjustedFields = fields.map((f) =>
      f.order >= newOrder ? { ...f, order: f.order + 1 } : f
    );

    set({
      fields: [...adjustedFields, newField].sort((a, b) => a.order - b.order),
      selectedFieldId: newField.id,
      hasUnsavedChanges: true,
    });
  },

  updateField: (id, updates) => {
    const fields = get().fields;
    set({
      fields: fields.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
      hasUnsavedChanges: true,
    });
  },

  deleteField: (id) => {
    const fields = get().fields;
    const field = fields.find((f) => f.id === id);
    if (!field) return;

    // Remove field and adjust order
    const filtered = fields.filter((f) => f.id !== id);
    const adjusted = filtered.map((f) =>
      f.order > field.order ? { ...f, order: f.order - 1 } : f
    );

    set({
      fields: adjusted,
      selectedFieldId: get().selectedFieldId === id ? null : get().selectedFieldId,
      hasUnsavedChanges: true,
    });
  },

  duplicateField: (id) => {
    const fields = get().fields;
    const field = fields.find((f) => f.id === id);
    if (!field) return;

    const newField: FormField = {
      ...field,
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      order: field.order + 1,
    };

    const adjusted = fields.map((f) =>
      f.order > field.order ? { ...f, order: f.order + 1 } : f
    );

    set({
      fields: [...adjusted, newField].sort((a, b) => a.order - b.order),
      selectedFieldId: newField.id,
      hasUnsavedChanges: true,
    });
  },

  reorderFields: (startIndex, endIndex) => {
    const fields = get().fields;
    const result = Array.from(fields);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update order based on new positions
    const reordered = result.map((f, index) => ({
      ...f,
      order: index,
    }));

    set({
      fields: reordered,
      hasUnsavedChanges: true,
    });
  },

  selectField: (id) => {
    set({ selectedFieldId: id });
  },

  setFormTitle: (title) => {
    set({ formTitle: title, hasUnsavedChanges: true });
  },

  setFormDescription: (description) => {
    set({ formDescription: description, hasUnsavedChanges: true });
  },

  setFormSettings: (settings) => {
    set({
      formSettings: { ...get().formSettings, ...settings },
      hasUnsavedChanges: true,
    });
  },

  togglePreviewMode: () => {
    set({ isPreviewMode: !get().isPreviewMode, selectedFieldId: null });
  },

  markSaved: () => {
    set({ lastSaved: new Date(), hasUnsavedChanges: false });
  },

  markUnsaved: () => {
    set({ hasUnsavedChanges: true });
  },

  reset: () => {
    set(initialState);
  },
}));

function getDefaultLabel(type: FieldType): string {
  switch (type) {
    case 'text':
      return 'Short Text';
    case 'longtext':
      return 'Long Text';
    case 'email':
      return 'Email';
    case 'number':
      return 'Number';
    case 'phone':
      return 'Phone';
    case 'url':
      return 'URL';
    case 'date':
      return 'Date';
    case 'checkbox':
      return 'Checkbox';
    case 'radio':
      return 'Radio';
    case 'dropdown':
      return 'Dropdown';
    case 'rating':
      return 'Rating';
    case 'matrix':
      return 'Matrix Question';
    case 'ranking':
      return 'Ranking';
    case 'picture_choice':
      return 'Picture Choice';
    case 'signature':
      return 'Signature';
    case 'file':
      return 'File Upload';
    case 'page_break':
      return 'Page Break';
    case 'divider':
      return 'Divider';
    default:
      return 'Field';
  }
}
