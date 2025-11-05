'use client';

import { useEffect } from 'react';
import { useBuilderStore } from '@/lib/store/builder-store';
import { FieldPalette } from './FieldPalette';
import { FormBuilderCanvas } from './FormBuilderCanvas';
import { FieldSettings } from './FieldSettings';
import { FormSettings } from './FormSettings';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import type { Form, FormFieldDB } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface BuilderClientProps {
  formId: string;
  initialForm: Form;
  initialFields: FormFieldDB[];
}

export function BuilderClient({ formId, initialForm, initialFields }: BuilderClientProps) {
  const router = useRouter();
  const [showFormSettings, setShowFormSettings] = useState(false);
  const setFields = useBuilderStore((state) => state.setFields);
  const setFormTitle = useBuilderStore((state) => state.setFormTitle);
  const setFormDescription = useBuilderStore((state) => state.setFormDescription);
  const setFormSettings = useBuilderStore((state) => state.setFormSettings);
  const markSaved = useBuilderStore((state) => state.markSaved);

  // Initialize store with form data
  useEffect(() => {
    // Convert DB fields to FormField format
    const fields = initialFields.map((field) => ({
      id: field.id,
      dbId: field.id,
      type: field.field_type,
      label: field.label,
      order: field.field_order,
      config: {
        required: field.is_required,
        placeholder: field.placeholder || undefined,
        options: field.config?.options || undefined,
        helpText: field.config?.helpText || undefined,
        ...field.config,
      },
    }));

    setFields(fields);
    setFormTitle(initialForm.title);
    setFormDescription(initialForm.description);
    setFormSettings({
      thankYouMessage: initialForm.settings?.thankYouMessage as string | undefined,
      redirectUrl: initialForm.settings?.redirectUrl as string | undefined,
    });
    markSaved();
  }, [formId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        // Trigger save - handled by FormBuilderCanvas
        const saveButton = document.querySelector('[data-save-button]');
        if (saveButton) {
          (saveButton as HTMLButtonElement).click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Field Palette */}
      <div className="w-64 flex-shrink-0">
        <FieldPalette />
      </div>

      {/* Center - Canvas */}
      <div className="flex-1">
        <FormBuilderCanvas formId={formId} />
      </div>

      {/* Right Sidebar - Settings */}
      <div className="w-80 flex-shrink-0">
        <div className="h-full flex flex-col">
          <div className="border-b bg-white p-2">
            <div className="flex gap-2">
              <Button
                variant={showFormSettings ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFormSettings(false)}
                className="flex-1"
              >
                Field
              </Button>
              <Button
                variant={showFormSettings ? 'outline' : 'default'}
                size="sm"
                onClick={() => setShowFormSettings(true)}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Form
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {showFormSettings ? <FormSettings /> : <FieldSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
