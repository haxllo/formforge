'use client';

import { useState } from 'react';
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
import type { Form, FormFieldDB } from '@/lib/types';

interface PublicFormRendererProps {
  form: Form;
  fields: FormFieldDB[];
}

export function PublicFormRenderer({ form, fields }: PublicFormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const schema = createSubmissionSchema(fields);
  const formSettings = (form.settings || {}) as {
    thankYouMessage?: string;
    redirectUrl?: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
  });

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.map((field) => {
        if (field.field_type === 'divider') {
          return <Separator key={field.id} className="my-6" />;
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
