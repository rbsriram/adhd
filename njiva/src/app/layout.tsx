// app/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 console.log('[APPLAYOUT] Mounted**********************');

 return (
   <html lang="en" className="dark">
     <body className={inter.className}>
       {children}
     </body>
   </html>
 );
}