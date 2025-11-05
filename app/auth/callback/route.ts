import { createClientSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    try {
      const supabase = await createClientSupabase();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        // Redirect to sign-in with error message if exchange fails
        const signInUrl = new URL('/sign-in', requestUrl.origin);
        signInUrl.searchParams.set('error', 'invalid_code');
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      // Redirect to sign-in on error
      const signInUrl = new URL('/sign-in', requestUrl.origin);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Construct redirect URL - ensure it's a valid path
  const redirectUrl = redirectTo.startsWith('/') 
    ? new URL(redirectTo, requestUrl.origin)
    : new URL(`/${redirectTo}`, requestUrl.origin);
    
  return NextResponse.redirect(redirectUrl);
}
