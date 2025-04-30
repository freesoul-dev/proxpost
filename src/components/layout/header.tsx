import Link from 'next/link';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePostDialog } from '@/components/posts/create-post-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Removed the left-aligned logo */}
        <div className="flex flex-1 items-center justify-center">
          {/* Centered Logo */}
          <Link href="/" className="flex items-center space-x-2">
             {/* Simple Text Logo */}
             <span className="text-lg font-bold tracking-wider">DEMO LAND</span>
          </Link>
        </div>
        <div className="flex items-center justify-end space-x-2">
          {/* Create Post Button remains on the right */}
          <CreatePostDialog />
        </div>
      </div>
    </header>
  );
}
