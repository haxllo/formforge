import { createClientSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';

  // Handle errors from Supabase (e.g., expired link, invalid code)
  if (error) {
    console.error('Auth error:', error, errorDescription);
    const signInUrl = new URL('/sign-in', requestUrl.origin);
    if (redirectTo && redirectTo !== '/dashboard') {
      signInUrl.searchParams.set('redirect', redirectTo);
    }
    signInUrl.searchParams.set('error', error);
    if (errorDescription) {
      signInUrl.searchParams.set('error_description', errorDescription);
    }
    return NextResponse.redirect(signInUrl);
  }

  if (code) {
    try {
      const supabase = await createClientSupabase();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        // Redirect to sign-in with error message if exchange fails
        const signInUrl = new URL('/sign-in', requestUrl.origin);
        if (redirectTo && redirectTo !== '/dashboard') {
          signInUrl.searchParams.set('redirect', redirectTo);
        }
        signInUrl.searchParams.set('error', exchangeError.message || 'invalid_code');
        return NextResponse.redirect(signInUrl);
      }

      // Successfully authenticated - redirect to dashboard
      const redirectUrl = redirectTo.startsWith('/') 
        ? new URL(redirectTo, requestUrl.origin)
        : new URL(`/${redirectTo}`, requestUrl.origin);
        
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in auth callback:', error);
      // Redirect to sign-in on error
      const signInUrl = new URL('/sign-in', requestUrl.origin);
      if (redirectTo && redirectTo !== '/dashboard') {
        signInUrl.searchParams.set('redirect', redirectTo);
      }
      signInUrl.searchParams.set('error', 'authentication_failed');
      return NextResponse.redirect(signInUrl);
    }
  }

  // No code and no error - redirect to sign-in
  const signInUrl = new URL('/sign-in', requestUrl.origin);
  if (redirectTo && redirectTo !== '/dashboard') {
    signInUrl.searchParams.set('redirect', redirectTo);
  }
  return NextResponse.redirect(signInUrl);
}
