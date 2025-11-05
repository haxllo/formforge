import { redirect } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/server';
import { Header } from '@/components/shared/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?redirect=/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-8 px-4">{children}</main>
    </div>
  );
}
