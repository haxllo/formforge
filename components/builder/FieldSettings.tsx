'use client';

import { useBuilderStore } from '@/lib/store/builder-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2, Plus, X } from 'lucide-react';
import type { FormField, FieldCondition, ConditionOperator } from '@/lib/types';

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

        {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'dropdown') && (
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

        {field.type === 'number' && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="min">Min Value</Label>
                  <Input
                    id="min"
                    type="number"
                    value={field.config.min !== undefined ? String(field.config.min) : ''}
                    onChange={(e) =>
                      handleUpdate({
                        config: {
                          ...field.config,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="Min"
                  />
                </div>
                <div>
                  <Label htmlFor="max">Max Value</Label>
                  <Input
                    id="max"
                    type="number"
                    value={field.config.max !== undefined ? String(field.config.max) : ''}
                    onChange={(e) =>
                      handleUpdate({
                        config: {
                          ...field.config,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {field.type === 'rating' && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="maxRating">Max Rating</Label>
              <Input
                id="maxRating"
                type="number"
                value={String(field.config.maxRating ?? 5)}
                onChange={(e) =>
                  handleUpdate({
                    config: {
                      ...field.config,
                      maxRating: e.target.value ? Number(e.target.value) : 5,
                    },
                  })
                }
                min={1}
                max={10}
              />
            </div>
          </>
        )}

        {field.type === 'file' && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="fileTypes">Allowed File Types</Label>
              <Input
                id="fileTypes"
                value={typeof field.config.fileTypes === 'string' ? field.config.fileTypes : ''}
                onChange={(e) =>
                  handleUpdate({
                    config: { ...field.config, fileTypes: e.target.value },
                  })
                }
                placeholder="e.g., .pdf,.doc,.docx (leave empty for all)"
              />
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={field.config.maxFileSize !== undefined ? String(field.config.maxFileSize) : ''}
                onChange={(e) =>
                  handleUpdate({
                    config: {
                      ...field.config,
                      maxFileSize: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="Max size in MB"
              />
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

        {field.type !== 'divider' && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Conditional Logic</Label>
              <p className="text-xs text-gray-500">
                Show this field only when a condition is met
              </p>
              {field.config.condition ? (
                <div className="space-y-2 rounded border p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Condition Active</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleUpdate({
                          config: { ...field.config, condition: undefined },
                        })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">When field</Label>
                      <select
                        className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
                        value={field.config.condition.fieldId}
                        onChange={(e) =>
                          handleUpdate({
                            config: {
                              ...field.config,
                              condition: {
                                ...field.config.condition!,
                                fieldId: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select field...</option>
                        {fields
                          .filter((f) => f.id !== field.id && f.order < field.order)
                          .map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Operator</Label>
                      <select
                        className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
                        value={field.config.condition.operator}
                        onChange={(e) =>
                          handleUpdate({
                            config: {
                              ...field.config,
                              condition: {
                                ...field.config.condition!,
                                operator: e.target.value as ConditionOperator,
                              },
                            },
                          })
                        }
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not equals</option>
                        <option value="contains">contains</option>
                        <option value="not_contains">not contains</option>
                        <option value="greater_than">greater than</option>
                        <option value="less_than">less than</option>
                        <option value="is_empty">is empty</option>
                        <option value="is_not_empty">is not empty</option>
                      </select>
                    </div>
                    {!['is_empty', 'is_not_empty'].includes(
                      field.config.condition.operator
                    ) && (
                      <div>
                        <Label className="text-xs">Value</Label>
                        <Input
                          className="mt-1"
                          value={field.config.condition.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleUpdate({
                              config: {
                                ...field.config,
                                condition: {
                                  ...field.config.condition!,
                                  value: isNaN(Number(value)) ? value : Number(value),
                                },
                              },
                            });
                          }}
                          placeholder="Value to compare"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleUpdate({
                      config: {
                        ...field.config,
                        condition: {
                          fieldId: '',
                          operator: 'equals',
                          value: '',
                        },
                      },
                    })
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
