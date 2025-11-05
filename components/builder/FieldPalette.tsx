'use client';

import { useBuilderStore } from '@/lib/store/builder-store';
import { FIELD_TYPES } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { 
  Type, FileText, Mail, CheckSquare, Circle, Minus, Hash, Calendar, Upload, List, Star, Phone, Link,
  Grid3x3, ArrowUpDown, Image, PenTool, Divide
} from 'lucide-react';
import type { FieldType } from '@/lib/types';
import { useState } from 'react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  FileText,
  Mail,
  CheckSquare,
  Circle,
  Minus,
  Hash,
  Calendar,
  Upload,
  List,
  Star,
  Phone,
  Link,
  Grid3x3,
  ArrowUpDown,
  Image,
  PenTool,
  Divide,
};

export function FieldPalette() {
  const addField = useBuilderStore((state) => state.addField);
  const [expandedCategory, setExpandedCategory] = useState<string>('basic');

  const handleAddField = (type: FieldType) => {
    addField(type);
  };

  const categories = {
    basic: { label: 'Basic Fields', icon: Type },
    choice: { label: 'Choice Fields', icon: CheckSquare },
    advanced: { label: 'Advanced', icon: Star },
    layout: { label: 'Layout', icon: Minus },
  };

  const groupedFields = FIELD_TYPES.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof FIELD_TYPES>);

  return (
    <div className="h-full overflow-y-auto border-r bg-gray-50 p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">Field Types</h2>
      <div className="space-y-3">
        {Object.entries(categories).map(([key, cat]) => {
          const CategoryIcon = cat.icon;
          const fields = groupedFields[key] || [];
          const isExpanded = expandedCategory === key;
          
          return (
            <div key={key} className="space-y-1">
              <button
                onClick={() => setExpandedCategory(isExpanded ? '' : key)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4" />
                  {cat.label}
                </div>
                <span className="text-xs text-gray-500">{isExpanded ? '−' : '+'}</span>
              </button>
              {isExpanded && (
                <div className="ml-2 space-y-1">
                  {fields.map((fieldType) => {
                    const Icon = iconMap[fieldType.icon as keyof typeof iconMap] || Type;
                    return (
                      <Card
                        key={fieldType.type}
                        className="cursor-pointer transition-colors hover:bg-gray-100"
                        onClick={() => handleAddField(fieldType.type)}
                      >
                        <div className="flex items-center gap-3 p-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">{fieldType.label}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        Click a field type to add it to your form
      </p>
    </div>
  );
}
