'use client';

import { useEffect, useState } from 'react';
import type { Post } from '@/lib/types';
import { getPostById } from '@/services/posts';
import { PostCard, PostCardSkeleton } from '@/components/posts/post-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PostPageProps {
  params: { id: string };
}

export default function PostPage({ params }: PostPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      const fetchPost = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedPost = await getPostById(params.id);
          if (fetchedPost) {
            setPost(fetchedPost);
          } else {
            setError('Post not found or has expired.');
          }
        } catch (err) {
          console.error('Failed to fetch post:', err);
          setError('Could not load the post. It may have been removed or the link is incorrect.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <PostCardSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Alert variant="destructive" className="max-w-md bg-destructive/80 dark:bg-destructive/60 backdrop-blur-sm border-white/10 text-destructive-foreground">
          <AlertTitle>Post Unavailable</AlertTitle>
          <AlertDescription>
            {error || 'This post could not be loaded. It might be expired or removed.'}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="bg-background/70 dark:bg-background/50 backdrop-blur-sm hover:bg-accent/70 dark:hover:bg-accent/50 border-white/20 dark:border-white/10">
          <Link href="/">Back to Feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-12">
      <PostCard post={post} />
    </div>
  );
}
