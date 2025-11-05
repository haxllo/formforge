'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthFormProps {
  redirectTo?: string;
  error?: string;
  errorDescription?: string;
}

export function AuthForm({ redirectTo, error, errorDescription }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createClient();

  // Show error message if present (from query params or hash fragment)
  useEffect(() => {
    // Check for error in URL hash (Supabase sends errors in hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get('error') || error;
    const hashErrorDescription = hashParams.get('error_description') || errorDescription;
    
    if (hashError) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (hashError === 'otp_expired' || hashError === 'access_denied' || hashError === 'expired_token') {
        errorMessage = hashErrorDescription || 'The magic link has expired or is invalid. Please request a new one.';
      } else if (hashErrorDescription) {
        errorMessage = hashErrorDescription.replace(/\+/g, ' ');
      }
      
      toast.error(errorMessage, { duration: 6000 });
      
      // Clean up the hash from URL
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [error, errorDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo || '/dashboard')}`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setEmailSent(true);
      toast.success('Check your email for the magic link!');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Check your email</h3>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a magic link to <strong>{email}</strong>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Click the link in the email to sign in
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEmailSent(false);
            setEmail('');
          }}
          className="w-full"
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send magic link'
        )}
      </Button>
      <p className="text-center text-xs text-gray-500">
        We'll send you a secure link to sign in without a password
      </p>
    </form>
  );
}
