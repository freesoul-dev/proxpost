import Link from 'next/link';
import { Camera } from 'lucide-react';
// Button import already exists
import { CreatePostDialog } from '@/components/posts/create-post-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/20 dark:border-white/10 bg-background/70 dark:bg-background/50 backdrop-blur-md shadow-lg supports-[backdrop-filter]:bg-background/50">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-center">
          <Link href="/" className="flex items-center space-x-2">
             <span className="text-lg font-bold tracking-wider">DEMO LAND</span>
          </Link>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <CreatePostDialog />
        </div>
      </div>
    </header>
  );
}
