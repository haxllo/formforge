import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClientSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold text-primary">FormForge</h1>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900">
            Build Beautiful Forms
            <br />
            <span className="text-primary">Without Code</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600">
            Create, customize, and share forms with a powerful drag-and-drop builder
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/sign-in">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}