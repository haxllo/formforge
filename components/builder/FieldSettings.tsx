'use client';

import { useBuilderStore } from '@/lib/store/builder-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import type { FormField } from '@/lib/types';

export function FieldSettings() {
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const fields = useBuilderStore((state) => state.fields);
  const updateField = useBuilderStore((state) => state.updateField);
  const deleteField = useBuilderStore((state) => state.deleteField);

  if (!selectedFieldId) {
    return (
      <div className="h-full border-l bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Select a field to edit its properties</p>
      </div>
    );
  }

  const field = fields.find((f) => f.id === selectedFieldId);
  if (!field) return null;

  const handleUpdate = (updates: Partial<FormField>) => {
    updateField(selectedFieldId, updates);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this field?')) {
      deleteField(selectedFieldId);
    }
  };

  return (
    <div className="h-full overflow-y-auto border-l bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Field Settings</h3>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={field.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            placeholder="Field label"
          />
        </div>

        {field.type !== 'divider' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={field.config.placeholder || ''}
                onChange={(e) =>
                  handleUpdate({
                    config: { ...field.config, placeholder: e.target.value },
                  })
                }
                placeholder="Placeholder text"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={field.config.required || false}
                onCheckedChange={(checked) =>
                  handleUpdate({
                    config: { ...field.config, required: checked === true },
                  })
                }
              />
              <Label htmlFor="required" className="cursor-pointer">
                Required field
              </Label>
            </div>
          </>
        )}

        {(field.type === 'radio' || field.type === 'checkbox') && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Options</Label>
              {(field.config.options || []).map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(field.config.options || [])];
                      newOptions[index] = e.target.value;
                      handleUpdate({
                        config: { ...field.config, options: newOptions },
                      });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = (field.config.options || []).filter(
                        (_, i) => i !== index
                      );
                      handleUpdate({
                        config: { ...field.config, options: newOptions },
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(field.config.options || []), 'New Option'];
                  handleUpdate({
                    config: { ...field.config, options: newOptions },
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </>
        )}

        {field.type === 'longtext' && (
          <div className="space-y-2">
            <Label htmlFor="helpText">Help Text</Label>
            <Textarea
              id="helpText"
              value={field.config.helpText || ''}
              onChange={(e) =>
                handleUpdate({
                  config: { ...field.config, helpText: e.target.value },
                })
              }
              placeholder="Additional instructions"
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  );
}
