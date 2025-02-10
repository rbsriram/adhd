// app/(app)/layout.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
console.log(`[APPLAYOUT] Mounted**********************`);
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const cookieStore = await cookies(); // Ensure cookies are awaited
  const sessionToken = cookieStore.get('njiva-session');

  console.log(`[APPLAYOUT] njiva-session token: ${sessionToken?.value || 'No session token found'}`);

  if (!sessionToken) {
    console.log('[APPLAYOUT] No session token. Redirecting to "/"');
    redirect('/');
  }

  console.log('[APPLAYOUT] Session token found. Allowing access to dashboard');
  console.log('[APPLAYOUT] Children rendered:', !!children);

  return (
    <div className="min-h-screen flex">
      {/* Add Sidebar component here if needed */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
