'use client';

import { useBuilderStore } from '@/lib/store/builder-store';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { GripVertical, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { FormField } from '@/lib/types';

interface DraggableFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
}

function DraggableField({ field, isSelected, onSelect }: DraggableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-4 rounded-lg border-2 bg-white p-4 transition-all ${
        isSelected ? 'border-primary' : 'border-gray-200'
      } ${isDragging ? 'shadow-lg' : 'hover:border-gray-300'}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <label className="text-sm font-medium text-gray-900">
          {field.label}
          {field.config.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      <FieldPreview field={field} />
    </div>
  );
}

function FieldPreview({ field }: { field: FormField }) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          placeholder={field.config.placeholder || 'Enter text...'}
          disabled
          className="bg-gray-50"
        />
      );
    case 'email':
      return (
        <Input
          type="email"
          placeholder={field.config.placeholder || 'you@example.com'}
          disabled
          className="bg-gray-50"
        />
      );
    case 'longtext':
      return (
        <div>
          <Textarea
            placeholder={field.config.placeholder || 'Enter text...'}
            disabled
            className="bg-gray-50"
            rows={3}
          />
          {field.config.helpText && (
            <p className="mt-1 text-xs text-gray-500">{field.config.helpText}</p>
          )}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-2">
          {(field.config.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox disabled checked={false} />
              <label className="text-sm text-gray-700">{option}</label>
            </div>
          ))}
        </div>
      );
    case 'radio':
      return (
        <RadioGroup disabled>
          {(field.config.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${field.id}-${index}`} />
              <label htmlFor={`${field.id}-${index}`} className="text-sm text-gray-700">
                {option}
              </label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'number':
      return (
        <Input
          type="number"
          placeholder={field.config.placeholder || 'Enter number...'}
          disabled
          className="bg-gray-50"
        />
      );
    case 'date':
      return (
        <Input
          type="date"
          disabled
          className="bg-gray-50"
        />
      );
    case 'phone':
      return (
        <Input
          type="tel"
          placeholder={field.config.placeholder || '+1 (555) 000-0000'}
          disabled
          className="bg-gray-50"
        />
      );
    case 'url':
      return (
        <Input
          type="url"
          placeholder={field.config.placeholder || 'https://example.com'}
          disabled
          className="bg-gray-50"
        />
      );
    case 'dropdown':
      return (
        <select disabled className="w-full px-3 py-2 border rounded-md bg-gray-50">
          <option>Select an option...</option>
          {(field.config.options || []).slice(0, 3).map((option, index) => (
            <option key={index}>{option}</option>
          ))}
        </select>
      );
    case 'rating':
      return (
        <div className="flex gap-2">
          {Array.from({ length: typeof field.config?.maxRating === 'number' ? field.config.maxRating : 5 }, (_, i) => (
            <span key={i} className="text-2xl text-gray-300">★</span>
          ))}
        </div>
      );
    case 'file':
      return (
        <Input
          type="file"
          disabled
          className="bg-gray-50"
        />
      );
    case 'divider':
      return <Separator />;
    default:
      return null;
  }
}

interface FormBuilderCanvasProps {
  formId: string;
}

export function FormBuilderCanvas({ formId }: FormBuilderCanvasProps) {
  const router = useRouter();
  const fields = useBuilderStore((state) => state.fields);
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const isPreviewMode = useBuilderStore((state) => state.isPreviewMode);
  const togglePreviewMode = useBuilderStore((state) => state.togglePreviewMode);
  const selectField = useBuilderStore((state) => state.selectField);
  const reorderFields = useBuilderStore((state) => state.reorderFields);
  const lastSaved = useBuilderStore((state) => state.lastSaved);
  const hasUnsavedChanges = useBuilderStore((state) => state.hasUnsavedChanges);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      reorderFields(oldIndex, newIndex);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const state = useBuilderStore.getState();
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: state.fields,
          title: state.formTitle,
          description: state.formDescription,
          settings: {
            thankYouMessage: state.formSettings.thankYouMessage,
            redirectUrl: state.formSettings.redirectUrl,
            webhookUrl: state.formSettings.webhookUrl,
            webhookEnabled: state.formSettings.webhookEnabled,
            enableHoneypot: state.formSettings.enableHoneypot,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      state.markSaved();
      toast.success('Form saved successfully');
    } catch (error) {
      toast.error('Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save with debouncing
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, hasUnsavedChanges]);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreviewMode}
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          {hasUnsavedChanges && (
            <span className="text-sm text-gray-500">Unsaved changes</span>
          )}
          {lastSaved && !hasUnsavedChanges && (
            <span className="text-sm text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges} data-save-button>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
        <div className="mx-auto max-w-2xl">
          {fields.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-gray-500">No fields yet. Add fields from the left panel.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field) => (
                  <DraggableField
                    key={field.id}
                    field={field}
                    isSelected={selectedFieldId === field.id}
                    onSelect={() => selectField(field.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
