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
      const location = await getCurrentLocation();
      const nearbyPosts = await getNearbyPosts(location);
      const now = new Date();
      const activePosts = nearbyPosts.filter(post => new Date(post.expiresAt) > now);
      setPosts(activePosts);
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
    
    const handlePostCreated = () => fetchPosts(true);
    window.addEventListener('postCreated', handlePostCreated);

    // Periodically check for expired posts client-side (or rely on next fetch)
    const expiryCheckInterval = setInterval(() => {
      const now = new Date();
      setPosts(prevPosts => prevPosts.filter(post => new Date(post.expiresAt) > now));
    }, 60 * 1000); // Check every minute for expired posts

    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
      clearInterval(expiryCheckInterval);
    };
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
      <Alert variant="destructive" className="bg-destructive/80 dark:bg-destructive/60 backdrop-blur-sm border-white/10 text-destructive-foreground">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
            {error}
             <Button onClick={() => fetchPosts(true)} variant="link" size="sm" className="p-0 h-auto ml-2 text-destructive-foreground hover:text-destructive-foreground/80">
                Retry
            </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Button 
                onClick={() => fetchPosts(true)} 
                variant="outline" 
                size="sm" 
                disabled={isRefreshing}
                className="bg-background/70 dark:bg-background/50 backdrop-blur-sm hover:bg-accent/70 dark:hover:bg-accent/50 border-white/20 dark:border-white/10"
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
            </Button>
        </div>
      {posts.length === 0 ? (
        <div className="text-center p-6 bg-background/70 dark:bg-background/50 backdrop-blur-md shadow-lg border border-white/20 dark:border-white/10">
            <p className="text-muted-foreground">No posts found nearby. Be the first to share!</p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
