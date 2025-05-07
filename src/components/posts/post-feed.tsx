
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Post, MediaType } from '@/lib/types';
import { PostCard, PostCardSkeleton } from './post-card';
import { getCurrentLocation } from '@/services/location';
import { getNearbyPosts } from '@/services/posts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from 'lucide-react';

export function PostFeed() {
  const [allPosts, setAllPosts] = useState<Post[]>([]); // Store all fetched posts
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]); // Posts to display after filtering
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<MediaType | 'all'>('all');

  const fetchPosts = useCallback(async (refresh = false) => {
    if (!refresh) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      const nearbyPosts = await getNearbyPosts(location);
      const now = new Date();
      const activePosts = nearbyPosts.filter(post => new Date(post.expiresAt) > now);
      setAllPosts(activePosts); // Store all active posts
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
    const handleRefreshFeed = () => fetchPosts(true);

    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('refreshFeed', handleRefreshFeed);

    const expiryCheckInterval = setInterval(() => {
      const now = new Date();
      setAllPosts(prevPosts => prevPosts.filter(post => new Date(post.expiresAt) > now));
    }, 60 * 1000); 

    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('refreshFeed', handleRefreshFeed);
      clearInterval(expiryCheckInterval);
    };
  }, [fetchPosts]);

  useEffect(() => {
    // Apply filter when allPosts or mediaFilter changes
    if (mediaFilter === 'all') {
      setFilteredPosts(allPosts);
    } else {
      setFilteredPosts(allPosts.filter(post => post.mediaType === mediaFilter));
    }
  }, [allPosts, mediaFilter]);


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
        <div className="flex justify-end items-center">
             <div className="flex items-center space-x-2 bg-background/70 dark:bg-background/50 backdrop-blur-sm p-2 border border-white/20 dark:border-white/10">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Select value={mediaFilter} onValueChange={(value) => setMediaFilter(value as MediaType | 'all')}>
                    <SelectTrigger className="w-[180px] h-9 bg-transparent border-input hover:bg-accent/10">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/90 dark:bg-background/80 backdrop-blur-md border-white/20 dark:border-white/10">
                        <SelectItem value="all">All Media</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      {filteredPosts.length === 0 ? (
        <div className="text-center p-6 bg-background/70 dark:bg-background/50 backdrop-blur-md shadow-lg border border-white/20 dark:border-white/10">
            <p className="text-muted-foreground">
              {mediaFilter === 'all' ? 'No posts found nearby. Be the first to share!' : `No ${mediaFilter} posts found nearby.`}
            </p>
        </div>
      ) : (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
