import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
// import DynamicBackground from '@/components/layout/DynamicBackground';
import { CommunityGuidelinesModal } from '@/components/layout/CommunityGuidelinesModal';

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
          'antialiased min-h-screen flex flex-col relative' // Added relative for z-indexing context
        )}
      >
        {/* <DynamicBackground /> */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url('https://picsum.photos/seed/ocean_birdseye/1920/1080')` }}
          data-ai-hint="ocean birdseye"
          aria-hidden="true"
        />
        {/* Content wrapper to ensure it's above the background */}
        <div className="relative z-0 flex flex-col flex-1 min-h-screen"> {/* z-0 or z-10, ensure content is above background */}
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
          <CommunityGuidelinesModal />
        </div>
      </body>
    </html>
  );
}
