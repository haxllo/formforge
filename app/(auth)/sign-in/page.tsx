import { redirect } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/server';
import { AuthForm } from '@/components/auth/AuthForm';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const supabase = createClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(searchParams.redirect || '/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">FormForge</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to get started
          </p>
        </div>
        <AuthForm redirectTo={searchParams.redirect} />
      </div>
    </div>
  );
}
