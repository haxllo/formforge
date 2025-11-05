'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, FileText, Copy, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Form } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FormCardProps {
  form: Form;
  submissionCount: number;
}

export function FormCard({ form, submissionCount }: FormCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/forms/${form.id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate form');
      }

      toast.success('Form duplicated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to duplicate form');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/forms/${form.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete form');
      }

      toast.success('Form deleted successfully');
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete form');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async () => {
    try {
      const newStatus = form.status === 'published' ? 'draft' : 'published';
      const response = await fetch(`/api/forms/${form.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Form ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/form/${form.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard');
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{form.title}</CardTitle>
              {form.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {form.description}
                </CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePublish}>
                  {form.status === 'published' ? 'Unpublish' : 'Publish'}
                </DropdownMenuItem>
                {form.status === 'published' && (
                  <DropdownMenuItem onClick={copyShareLink}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy share link
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
              {form.status}
            </Badge>
            <span className="text-sm text-gray-500">
              {submissionCount} {submissionCount === 1 ? 'submission' : 'submissions'}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link href={`/dashboard/forms/${form.id}/builder`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/forms/${form.id}/submissions`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{form.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
