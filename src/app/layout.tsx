import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
// import { Header } from '@/components/layout/header'; // Header removed
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
// import DynamicBackground from '@/components/layout/DynamicBackground';
import { CommunityGuidelinesModal } from '@/components/layout/CommunityGuidelinesModal';
import ExpandingMenu from '@/components/layout/ExpandingMenu'; // Added

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Proximity Post',
  description: 'Share media with users nearby.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'antialiased min-h-screen flex flex-col relative'
        )}
      >
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url('https://img.goodfon.com/original/3840x2160/c/25/voda-volny-okean.jpg')` }}
          data-ai-hint="ocean"
          aria-hidden="true"
        />
        <div className="relative z-0 flex flex-col flex-1 min-h-screen">
          {/* <Header /> Removed Header */}
          <main className="flex-1 container mx-auto px-4 py-8 pb-24"> {/* Adjusted pb-24 for ExpandingMenu spacing */}
            {children}
          </main>
          <ExpandingMenu /> {/* Added ExpandingMenu */}
          <Toaster />
          <CommunityGuidelinesModal />
        </div>
      </body>
    </html>
  );
}
