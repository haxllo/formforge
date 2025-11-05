'use client';

import { useBuilderStore } from '@/lib/store/builder-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export function FormSettings() {
  const formTitle = useBuilderStore((state) => state.formTitle);
  const formDescription = useBuilderStore((state) => state.formDescription);
  const formSettings = useBuilderStore((state) => state.formSettings);
  const setFormTitle = useBuilderStore((state) => state.setFormTitle);
  const setFormDescription = useBuilderStore((state) => state.setFormDescription);
  const setFormSettings = useBuilderStore((state) => state.setFormSettings);

  return (
    <div className="h-full overflow-y-auto border-l bg-gray-50 p-4">
      <h3 className="mb-4 text-sm font-semibold">Form Settings</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="form-title">Form Title</Label>
          <Input
            id="form-title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="My Form"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-description">Description</Label>
          <Textarea
            id="form-description"
            value={formDescription || ''}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Form description"
            rows={3}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="thank-you-message">Thank You Message</Label>
          <Textarea
            id="thank-you-message"
            value={formSettings.thankYouMessage || ''}
            onChange={(e) =>
              setFormSettings({ thankYouMessage: e.target.value })
            }
            placeholder="Thank you for your submission!"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="redirect-url">Redirect URL (optional)</Label>
          <Input
            id="redirect-url"
            type="url"
            value={formSettings.redirectUrl || ''}
            onChange={(e) => setFormSettings({ redirectUrl: e.target.value })}
            placeholder="https://example.com/thank-you"
          />
          <p className="text-xs text-gray-500">
            Redirect users to this URL after submission
          </p>
        </div>
      </div>
    </div>
  );
}
