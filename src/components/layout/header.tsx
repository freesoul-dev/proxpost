import Link from 'next/link';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePostDialog } from '@/components/posts/create-post-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a10 10 0 0 0-10 10c0 4.42 2.87 8.17 6.84 9.5.6.11.82-.26.82-.57 0-.28-.01-1.02-.01-2-2.8.61-3.4-1.36-3.4-1.36-.54-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23.95-.26 1.98-.39 3-.4s2.05.13 3 .4c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18 1.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.81 1.1.81 2.22 0 1.6-.01 2.88-.01 3.28 0 .31.22.69.83.57A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z"/>
            </svg>
            <span className="font-bold">no-pressure.space</span>
          </Link>
          {/* Add navigation links here if needed */}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <CreatePostDialog />
        </div>
      </div>
    </header>
  );
}
