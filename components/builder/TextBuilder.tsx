'use client';

import { useState, useRef, useEffect } from 'react';
import { useBuilderStore } from '@/lib/store/builder-store';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import type { FormField } from '@/lib/types';

interface TextBuilderProps {
  formId: string;
}

// Parse text-based form syntax
function parseTextForm(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  const fields: Array<{ type: string; label: string; config: Record<string, unknown> }> = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for field type markers
    if (trimmed.startsWith('/')) {
      const match = trimmed.match(/^\/(\w+)\s+(.+)$/);
      if (match) {
        const [, type, label] = match;
        fields.push({
          type: type.toLowerCase(),
          label: label.trim(),
          config: { required: false },
        });
      }
    } else if (trimmed.startsWith('*')) {
      // Required field marker
      const label = trimmed.substring(1).trim();
      fields.push({
        type: 'text',
        label,
        config: { required: true },
      });
    } else if (trimmed.startsWith('-')) {
      // Divider
      fields.push({
        type: 'divider',
        label: '',
        config: {},
      });
    } else if (trimmed.includes('?')) {
      // Checkbox/Radio options
      const [label, optionsStr] = trimmed.split('?');
      const options = optionsStr?.split(',').map(o => o.trim()).filter(Boolean) || [];
      if (options.length > 0) {
        fields.push({
          type: 'radio',
          label: label.trim(),
          config: { required: false, options },
        });
      }
    } else {
      // Regular text field
      fields.push({
        type: 'text',
        label: trimmed,
        config: { required: false },
      });
    }
  }
  
  return fields;
}

export function TextBuilder({ formId }: TextBuilderProps) {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addField = useBuilderStore((state) => state.addField);
  const setFields = useBuilderStore((state) => state.setFields);
  const fields = useBuilderStore((state) => state.fields);

  // Auto-parse on text change with debounce
  useEffect(() => {
    if (!text.trim()) return;
    
    const timer = setTimeout(() => {
      setIsParsing(true);
      const parsedFields = parseTextForm(text);
      
      // Convert to FormField format
      const formFields = parsedFields.map((field, index) => ({
        id: `field-${Date.now()}-${index}`,
        type: field.type as FormField['type'],
        label: field.label,
        order: index,
        config: {
          ...field.config,
          required: typeof field.config.required === 'boolean' ? field.config.required : false,
        } as FormField['config'],
      }));
      
      setFields(formFields);
      setIsParsing(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [text, setFields]);

  const handleApply = () => {
    const parsedFields = parseTextForm(text);
    
    // Clear existing fields
    setFields([]);
    
    // Add new fields
    parsedFields.forEach((field, index) => {
      setTimeout(() => {
        addField(field.type as FormField['type'], index);
      }, index * 50);
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold">Text-Based Form Builder</Label>
          <Button size="sm" onClick={handleApply} disabled={!text.trim()}>
            Apply to Form
          </Button>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p>Type your form fields using simple syntax:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li><code>/text</code> or <code>/email</code> - Field types</li>
              <li><code>*</code> - Required field</li>
              <li><code>-</code> - Divider</li>
              <li><code>?</code> - Options (e.g., &quot;Question? Option 1, Option 2&quot;)</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Example:
Name
*Email
Phone Number
What's your favorite color? Red, Blue, Green
-
Comments
/textarea Message`}
          className="h-full font-mono text-sm resize-none"
        />
      </div>
      {isParsing && (
        <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50">
          Parsing...
        </div>
      )}
    </div>
  );
}

