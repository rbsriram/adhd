// app/(app)/layout.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('**********************[AppLayout]***********************');

  const cookieStore = await cookies(); // Ensure cookies are awaited
  const sessionToken = cookieStore.get('njiva-session');

  console.log(`[AppLayout] njiva-session token: ${sessionToken?.value || 'No session token found'}`);

  if (!sessionToken) {
    console.log('[AppLayout] No session token. Redirecting to "/"');
    redirect('/');
  }

  console.log('[AppLayout] Session token found. Allowing access to dashboard');

  return (
    <div className="min-h-screen flex">
      {/* Add Sidebar component here if needed */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
