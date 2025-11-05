'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSubmissionSchema } from '@/lib/validations/submission-schemas';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Form, FormFieldDB, FieldCondition } from '@/lib/types';
import { getThemeStyles } from '@/lib/themes';

interface PublicFormRendererProps {
  form: Form;
  fields: FormFieldDB[];
}

// Utility function to evaluate field conditions
function evaluateCondition(
  condition: FieldCondition,
  fieldValues: Record<string, unknown>,
  fields: FormFieldDB[]
): boolean {
  const targetField = fields.find((f) => f.id === condition.fieldId);
  if (!targetField) return true; // Show field if target field not found

  const targetFieldKey = targetField.label.toLowerCase().replace(/\s+/g, '_');
  const fieldValue = fieldValues[targetFieldKey];

  switch (condition.operator) {
    case 'equals':
      return String(fieldValue) === String(condition.value);
    case 'not_equals':
      return String(fieldValue) !== String(condition.value);
    case 'contains':
      return String(fieldValue || '').includes(String(condition.value || ''));
    case 'not_contains':
      return !String(fieldValue || '').includes(String(condition.value || ''));
    case 'greater_than':
      return Number(fieldValue) > Number(condition.value);
    case 'less_than':
      return Number(fieldValue) < Number(condition.value);
    case 'is_empty':
      return !fieldValue || String(fieldValue).trim() === '';
    case 'is_not_empty':
      return !!fieldValue && String(fieldValue).trim() !== '';
    default:
      return true;
  }
}

export function PublicFormRenderer({ form, fields }: PublicFormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const formSettings = (form.settings || {}) as {
    thankYouMessage?: string;
    redirectUrl?: string;
    theme?: string;
    themeConfig?: Record<string, unknown>;
    layout?: string;
    showProgressBar?: boolean;
    removeBranding?: boolean;
    logoUrl?: string;
  };

  // Generate theme styles (not used in component but could be exported)
  // const themeStyles = getThemeStyles(
  //   formSettings.theme || 'default',
  //   formSettings.themeConfig as Record<string, unknown>
  // );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createSubmissionSchema(fields)),
  });

  // Watch all form values to evaluate conditions
  const formValues = watch();

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/submit/${form.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Too many submissions. Please try again later.');
        } else {
          toast.error(result.error || 'Failed to submit form');
        }
        return;
      }

      setIsSuccess(true);
      toast.success('Form submitted successfully!');

      // Redirect if configured
      if (formSettings.redirectUrl) {
        setTimeout(() => {
          window.location.href = formSettings.redirectUrl!;
        }, 2000);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-12 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Thank You!</h2>
        <p className="mt-2 text-gray-600">
          {formSettings.thankYouMessage || 'Thank you for your submission!'}
        </p>
      </div>
    );
  }

  const formSettingsWithSpam = (form.settings || {}) as {
    enableHoneypot?: boolean;
    recaptchaEnabled?: boolean;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Honeypot field - hidden from users but visible to bots */}
      {formSettingsWithSpam.enableHoneypot && (
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          style={{ position: 'absolute', left: '-9999px' }}
          aria-hidden="true"
        />
      )}
      {fields.map((field, index) => {
        // Check if field should be visible based on conditions
        const isVisible = !field.config?.condition || 
          evaluateCondition(field.config.condition, formValues, fields);
        
        if (!isVisible) return null;
        if (field.field_type === 'divider') {
          return <Separator key={field.id} className="my-6" />;
        }
        if (field.field_type === 'page_break') {
          return (
            <div key={field.id} className="border-t-2 border-gray-300 my-8 pt-8">
              <div className="text-center text-sm text-gray-500">Page {index + 1}</div>
            </div>
          );
        }

        const fieldKey = field.label.toLowerCase().replace(/\s+/g, '_');
        const error = errors[fieldKey];

        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldKey}>
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.field_type === 'text' && (
              <Input
                id={fieldKey}
                {...register(fieldKey)}
                placeholder={field.placeholder || 'Enter text...'}
                className={error ? 'border-red-500' : ''}
              />
            )}

            {field.field_type === 'email' && (
              <Input
                id={fieldKey}
                type="email"
                {...register(fieldKey)}
                placeholder={field.placeholder || 'you@example.com'}
                className={error ? 'border-red-500' : ''}
              />
            )}

            {field.field_type === 'longtext' && (
              <div>
                <Textarea
                  id={fieldKey}
                  {...register(fieldKey)}
                  placeholder={field.placeholder || 'Enter text...'}
                  rows={4}
                  className={error ? 'border-red-500' : ''}
                />
                {field.config?.helpText && (
                  <p className="mt-1 text-xs text-gray-500">{field.config.helpText}</p>
                )}
              </div>
            )}

            {field.field_type === 'checkbox' && (
              <div className="space-y-2">
                {(field.config?.options || []).map((option, index) => {
                  const optionKey = `${fieldKey}_${index}`;
                  const currentValue = watch(fieldKey);
                  const valueArray = Array.isArray(currentValue) ? currentValue : [];
                  const isChecked = valueArray.includes(option);
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={optionKey}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue(fieldKey, [...valueArray, option]);
                          } else {
                            setValue(
                              fieldKey,
                              valueArray.filter((v: string) => v !== option)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={optionKey} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {field.field_type === 'radio' && (
              <RadioGroup
                value={watch(fieldKey) as string}
                onValueChange={(value) => setValue(fieldKey, value)}
              >
                {(field.config?.options || []).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${fieldKey}_${index}`} />
                    <Label htmlFor={`${fieldKey}_${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {field.field_type === 'number' && (
              <Input
                id={fieldKey}
                type="number"
                {...register(fieldKey, {
                  valueAsNumber: true,
                  min: typeof field.config?.min === 'number' ? field.config.min : undefined,
                  max: typeof field.config?.max === 'number' ? field.config.max : undefined,
                })}
                placeholder={field.placeholder || 'Enter number...'}
                className={error ? 'border-red-500' : ''}
              />
            )}

            {field.field_type === 'date' && (
              <Input
                id={fieldKey}
                type="date"
                {...register(fieldKey)}
                className={error ? 'border-red-500' : ''}
              />
            )}

            {field.field_type === 'phone' && (
              <Input
                id={fieldKey}
                type="tel"
                {...register(fieldKey)}
                placeholder={field.placeholder || '+1 (555) 000-0000'}
                className={error ? 'border-red-500' : ''}
              />
            )}

            {field.field_type === 'url' && (
              <Input
                id={fieldKey}
                type="url"
                {...register(fieldKey)}
                placeholder={field.placeholder || 'https://example.com'}
                className={error ? 'border-red-500' : ''}
              />
            )}

            {field.field_type === 'dropdown' && (
              <select
                id={fieldKey}
                {...register(fieldKey)}
                className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : ''}`}
              >
                <option value="">Select an option...</option>
                {(field.config?.options || []).map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.field_type === 'rating' && (
              <div className="flex gap-2">
                {Array.from({ length: typeof field.config?.maxRating === 'number' ? field.config.maxRating : 5 }, (_, i) => i + 1).map((star) => {
                  const currentValue = watch(fieldKey);
                  const rating = typeof currentValue === 'number' ? currentValue : 0;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue(fieldKey, star)}
                      className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            )}

            {field.field_type === 'file' && (
              <Input
                id={fieldKey}
                type="file"
                {...register(fieldKey)}
                accept={typeof field.config?.fileTypes === 'string' ? field.config.fileTypes : '*'}
                className={error ? 'border-red-500' : ''}
              />
            )}

            {field.field_type === 'matrix' && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2"></th>
                      {(field.config?.columns as string[] || []).map((col, i) => (
                        <th key={i} className="border p-2 text-sm font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(field.config?.rows as string[] || []).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="border p-2 text-sm font-medium">{row}</td>
                        {(field.config?.columns as string[] || []).map((col, colIndex) => (
                          <td key={colIndex} className="border p-2 text-center">
                            <input
                              type="radio"
                              {...register(`${fieldKey}_${rowIndex}`)}
                              value={col}
                              className="h-4 w-4"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {field.field_type === 'ranking' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">Drag to reorder by preference</p>
                {(field.config?.options as string[] || []).map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-md bg-white hover:bg-gray-50 cursor-move"
                  >
                    <span className="text-gray-400">☰</span>
                    <span className="font-medium">{index + 1}.</span>
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            )}

            {field.field_type === 'picture_choice' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(field.config?.imageUrls as string[] || []).map((imageUrl, index) => {
                  const option = (field.config?.options as string[])?.[index] || '';
                  const currentValue = watch(fieldKey);
                  const isSelected = currentValue === option;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setValue(fieldKey, option)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={option} className="w-full h-32 object-cover" />
                      <div className="p-2 text-sm font-medium">{option}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {field.field_type === 'signature' && (
              <div>
                <div className="border-2 border-dashed rounded-md p-4 bg-gray-50">
                  <canvas
                    id={fieldKey}
                    className="w-full h-32 bg-white border rounded cursor-crosshair"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const canvas = document.getElementById(fieldKey) as HTMLCanvasElement;
                      if (canvas) {
                        const ctx = canvas.getContext('2d');
                        ctx?.clearRect(0, 0, canvas.width, canvas.height);
                      }
                    }}
                    className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear signature
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );
      })}

      <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit'
        )}
      </Button>
    </form>
  );
}
