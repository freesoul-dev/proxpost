

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Post, MediaType } from '@/lib/types';
import { PostCard, PostCardSkeleton } from './post-card';
import { getCurrentLocation } from '@/services/location';
import { getNearbyPosts } from '@/services/posts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, RefreshCw, ArrowDown } from 'lucide-react'; // Added RefreshCw, ArrowDown

export function PostFeed() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // For non-pull refreshes
  const [mediaFilter, setMediaFilter] = useState<MediaType | 'all'>('all');
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // State for pull-to-refresh
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [pullProgress, setPullProgress] = useState(0); // 0 to 1
  const [isRefreshingFromPull, setIsRefreshingFromPull] = useState(false);
  const PULL_THRESHOLD = 70; // Pixels to pull to trigger refresh

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPosts = useCallback(async (isRefreshOperation = false) => {
    const isInitialLoad = !isRefreshOperation && !allPosts.length && !error;

    if (isInitialLoad) {
      setIsLoading(true);
    } else if (isRefreshOperation && !isRefreshingFromPull) {
      setIsRefreshing(true); 
    }
    
    // Clear previous errors on refresh, but not on initial load if it's already loading
    // and not if it's a pull-to-refresh operation as error is handled differently or not shown there
    if (isRefreshOperation && !isRefreshingFromPull) {
        setError(null); 
    }


    try {
      const location = await getCurrentLocation();
      const nearbyPosts = await getNearbyPosts(location);
      const now = new Date();
      const activePosts = nearbyPosts.filter(post => new Date(post.expiresAt) > now);
      setAllPosts(activePosts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      if (!isRefreshingFromPull) { // Don't show full error alert for pull-to-refresh, rely on toast or silent failure
          setError('Could not load posts. Please try again.');
      }
    } finally {
      if (isInitialLoad) setIsLoading(false);
      if (isRefreshOperation && !isRefreshingFromPull) setIsRefreshing(false);
      // isRefreshingFromPull is reset by its own logic in handleTouchEnd
    }
  }, [allPosts.length, error, isRefreshingFromPull]);


  useEffect(() => {
    fetchPosts(); // Initial fetch
    
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
    if (mediaFilter === 'all') {
      setFilteredPosts(allPosts);
    } else {
      setFilteredPosts(allPosts.filter(post => post.mediaType === mediaFilter));
    }
  }, [allPosts, mediaFilter]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isLoading && !isRefreshing && !isRefreshingFromPull) {
      setTouchStartY(e.touches[0].clientY);
    } else {
      setTouchStartY(null);
    }
  }, [isLoading, isRefreshing, isRefreshingFromPull]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY === null) return;

    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY;

    if (diffY > 0) {
      const progress = Math.min(1, diffY / PULL_THRESHOLD);
      setPullProgress(progress);
    } else {
      setPullProgress(0);
    }
  }, [touchStartY, PULL_THRESHOLD]);

  const handleTouchEnd = useCallback(async () => {
    if (touchStartY === null) return;

    if (pullProgress === 1) {
      setIsRefreshingFromPull(true);
      setPullProgress(0); 
      setTouchStartY(null);
      try {
        await fetchPosts(true);
      } catch (err) {
        // Errors are handled by fetchPosts or can be toasted here if needed
        console.error("Pull to refresh failed:", err);
      } finally {
        setIsRefreshingFromPull(false);
      }
    } else {
      setPullProgress(0);
      setTouchStartY(null);
    }
  }, [touchStartY, pullProgress, fetchPosts]);

  const PullToRefreshIndicator = () => {
    let content = null;
    if (isRefreshingFromPull) {
      content = <RefreshCw className="h-6 w-6 animate-spin text-accent" />;
    } else if (pullProgress > 0) {
      content = (
        <>
          <ArrowDown
            className="h-6 w-6 text-muted-foreground transition-transform duration-150"
            style={{ transform: `rotate(${pullProgress * 180}deg) scale(${0.8 + pullProgress * 0.2})` }}
          />
          {pullProgress === 1 && <span className="ml-2 text-sm text-muted-foreground">Release to refresh</span>}
        </>
      );
    }
  
    return (
      <div
        className="flex justify-center items-center overflow-hidden transition-all duration-200 ease-out"
        style={{
          height: (isRefreshingFromPull || pullProgress > 0) ? '4rem' : '0rem', // h-16 or h-0
          opacity: (isRefreshingFromPull || pullProgress > 0) ? 1 : 0,
        }}
      >
        {content}
      </div>
    );
  };


  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="space-y-6"
    >
      <PullToRefreshIndicator />
      
      <div className="z-30 flex items-center fixed top-6 right-6">
        <Select value={mediaFilter} onValueChange={(value) => setMediaFilter(value as MediaType | 'all')}>
          <SelectTrigger
            className="w-auto min-w-[150px] bg-background/70 dark:bg-background/50 backdrop-blur-md border border-white/20 dark:border-white/10 text-foreground shadow-lg hover:bg-accent/70 dark:hover:bg-accent/50"
          >
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-background/80 dark:bg-background/60 backdrop-blur-md border-white/20 dark:border-white/10">
            <SelectItem value="all">All Media</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="bg-destructive/80 dark:bg-destructive/60 backdrop-blur-sm border-white/10 text-destructive-foreground">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
              {error}
               <Button onClick={() => fetchPosts(true)} variant="link" size="sm" className="p-0 h-auto ml-2 text-destructive-foreground hover:text-destructive-foreground/80">
                  Retry
              </Button>
          </AlertDescription>
        </Alert>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center p-6 bg-background/50 dark:bg-background/30 backdrop-blur-md shadow-lg border border-white/20 dark:border-white/10 rounded-lg">
            <p className="text-muted-foreground">
              {mediaFilter === 'all' ? 'No posts found nearby. Be the first to share!' : `No ${mediaFilter} posts found nearby.`}
            </p>
        </div>
      ) : (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
      )}

       {showScrollToTop && (
          <div className="fixed bottom-6 right-6 z-20"> 
            <Button
              aria-label="Scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-background/40 dark:bg-background/20 backdrop-blur-md p-2 rounded-full border-white/20 dark:border-white/10"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        )}
    </div>
  );
}

