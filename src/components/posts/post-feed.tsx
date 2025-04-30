'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Post } from '@/lib/types';
import { PostCard, PostCardSkeleton } from './post-card';
import { getCurrentLocation } from '@/services/location';
import { getNearbyPosts } from '@/services/posts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPosts = useCallback(async (refresh = false) => {
    if (!refresh) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      // TODO: Implement actual geolocation fetching. Using mock for now.
      const location = await getCurrentLocation();
      const nearbyPosts = await getNearbyPosts(location);
      setPosts(nearbyPosts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Could not load posts. Please try again.');
    } finally {
       if (!refresh) setIsLoading(false);
       else setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
            {error}
             <Button onClick={() => fetchPosts(true)} variant="link" size="sm" className="p-0 h-auto ml-2">
                Retry
            </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Button onClick={() => fetchPosts(true)} variant="outline" size="sm" disabled={isRefreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
            </Button>
        </div>
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts found nearby. Be the first to share!</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
