import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const ActionButton = actionHref ? (
    <Link href={actionHref}>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        {actionLabel || 'Get Started'}
      </Button>
    </Link>
  ) : onAction ? (
    <Button onClick={onAction}>
      <Plus className="h-4 w-4 mr-2" />
      {actionLabel || 'Get Started'}
    </Button>
  ) : null;

  return (
    <div className="rounded-lg border border-dashed bg-white p-12 text-center">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      {ActionButton && <div className="mt-6">{ActionButton}</div>}
    </div>
  );
}
