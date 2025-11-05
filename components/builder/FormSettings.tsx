'use client';

import { useBuilderStore } from '@/lib/store/builder-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { FORM_THEMES } from '@/lib/themes';
import type { FormTheme, FormLayout } from '@/lib/types';

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

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="webhook-enabled"
              checked={formSettings.webhookEnabled || false}
              onCheckedChange={(checked) =>
                setFormSettings({ webhookEnabled: checked === true })
              }
            />
            <Label htmlFor="webhook-enabled" className="cursor-pointer">
              Enable Webhook
            </Label>
          </div>
          {formSettings.webhookEnabled && (
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                value={formSettings.webhookUrl || ''}
                onChange={(e) => setFormSettings({ webhookUrl: e.target.value })}
                placeholder="https://api.example.com/webhook"
              />
              <p className="text-xs text-gray-500">
                POST requests will be sent to this URL when a form is submitted
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Form Appearance</Label>
          
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              value={formSettings.theme || 'default'}
              onChange={(e) => setFormSettings({ theme: e.target.value as FormTheme })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {Object.keys(FORM_THEMES).map((theme) => (
                <option key={theme} value={theme}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <select
              id="layout"
              value={formSettings.layout || 'single'}
              onChange={(e) => setFormSettings({ layout: e.target.value as FormLayout })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="single">Single Column</option>
              <option value="two-column">Two Columns</option>
              <option value="card">Card Style</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="progress-bar"
              checked={formSettings.showProgressBar || false}
              onCheckedChange={(checked) =>
                setFormSettings({ showProgressBar: checked === true })
              }
            />
            <Label htmlFor="progress-bar" className="cursor-pointer">
              Show Progress Bar
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remove-branding"
              checked={formSettings.removeBranding || false}
              onCheckedChange={(checked) =>
                setFormSettings({ removeBranding: checked === true })
              }
            />
            <Label htmlFor="remove-branding" className="cursor-pointer">
              Remove FormForge Branding (Pro)
            </Label>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Spam Protection</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="honeypot-enabled"
              checked={formSettings.enableHoneypot || false}
              onCheckedChange={(checked) =>
                setFormSettings({ enableHoneypot: checked === true })
              }
            />
            <Label htmlFor="honeypot-enabled" className="cursor-pointer">
              Enable Honeypot (Basic spam protection)
            </Label>
          </div>
          <p className="text-xs text-gray-500">
            Adds a hidden field to catch spam bots
          </p>
        </div>
      </div>
    </div>
  );
}
