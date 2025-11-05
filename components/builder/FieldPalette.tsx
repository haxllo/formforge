'use client';

import { useBuilderStore } from '@/lib/store/builder-store';
import { FIELD_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Type, FileText, Mail, CheckSquare, Circle, Minus, Hash, Calendar, Upload, List, Star, Phone, Link } from 'lucide-react';
import type { FieldType } from '@/lib/types';

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
};

export function FieldPalette() {
  const addField = useBuilderStore((state) => state.addField);

  const handleAddField = (type: FieldType) => {
    addField(type);
  };

  return (
    <div className="h-full overflow-y-auto border-r bg-gray-50 p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">Field Types</h2>
      <div className="space-y-2">
        {FIELD_TYPES.map((fieldType) => {
          const Icon = iconMap[fieldType.icon as keyof typeof iconMap] || Type;
          return (
            <Card
              key={fieldType.type}
              className="cursor-pointer transition-colors hover:bg-gray-100"
              onClick={() => handleAddField(fieldType.type)}
            >
              <div className="flex items-center gap-3 p-3">
                <Icon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{fieldType.label}</span>
              </div>
            </Card>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        Click a field type to add it to your form
      </p>
    </div>
  );
}
