'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CreatePostDialog } from '@/components/posts/create-post-dialog';
import { getCurrentLocation } from '@/services/location';
import type { Location } from '@/services/location';
import { MapPin, RefreshCw, PlusCircle, X, Menu as MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExpandingMenu() {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchLocation = useCallback(async () => {
    setIsFetchingLocation(true);
    setLocationError(null);
    try {
      const loc = await getCurrentLocation();
      if (loc.lat === 34.0522 && loc.lng === -118.2437) { // Default LA coordinates
        const geoPermission = await navigator.permissions.query({ name: 'geolocation' });
        if (geoPermission.state === 'denied') {
          setLocationError('Location access denied.');
        } else if (geoPermission.state === 'prompt') {
          setLocationError('Location not yet granted.');
        } else {
           setLocationError('Using default location.');
        }
      }
      setLocation(loc);
    } catch (error) {
      setLocationError('Failed to get location.');
      console.error(error);
    } finally {
      setIsFetchingLocation(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleRefreshFeed = () => {
    window.dispatchEvent(new CustomEvent('refreshFeed'));
    setIsMenuOpen(false); // Close menu after action
  };

  const renderLocationDisplay = () => {
    if (isFetchingLocation) {
      return <Skeleton className="h-5 w-48 bg-muted/50 rounded-md" />;
    }
    if (locationError) {
      return <span className="text-sm text-destructive-foreground/80">{locationError}</span>;
    }
    if (location) {
      return (
        <span className="text-sm">
          Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
        </span>
      );
    }
    return <span className="text-sm text-muted-foreground">Location unavailable</span>;
  };

  const handlePostCreated = () => {
    setIsMenuOpen(false); // Close menu after post is created
  };

  return (
    <>
      {/* Pulsing Menu Trigger Button */}
      {!isMenuOpen && (
        <Button
          variant="default"
          size="icon"
          className={cn(
            "fixed bottom-6 left-6 z-50 h-16 w-16 rounded-full shadow-xl",
            "bg-green-500/70 hover:bg-green-500/90 dark:bg-green-600/70 dark:hover:bg-green-600/90 text-white",
            "animate-pulse-shadow backdrop-blur-sm"
          )}
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon className="h-8 w-8" />
        </Button>
      )}

      {/* Full Viewport Menu */}
      {isMenuOpen && (
        <div 
          className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center p-6",
            "bg-background/80 dark:bg-background/70 backdrop-blur-xl",
            "transition-opacity duration-300 ease-in-out",
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 h-12 w-12 text-foreground hover:bg-accent/20"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-8 w-8" />
          </Button>

          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="flex items-center space-x-3 p-3 border border-foreground/20 bg-black/10 dark:bg-white/5 rounded-lg shadow-md">
              <MapPin className="h-6 w-6 text-accent" />
              {renderLocationDisplay()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
              <CreatePostDialog onPostCreated={handlePostCreated}>
                <Button variant="outline" size="lg" className="w-full h-auto py-4 flex flex-col items-center space-y-2 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200 transform hover:scale-105 shadow-lg rounded-lg">
                  <PlusCircle className="h-10 w-10" />
                  <span className="text-lg font-semibold">Create Post</span>
                </Button>
              </CreatePostDialog>

              <Button variant="outline" size="lg" onClick={handleRefreshFeed} className="w-full h-auto py-4 flex flex-col items-center space-y-2 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200 transform hover:scale-105 shadow-lg rounded-lg">
                <RefreshCw className="h-10 w-10" />
                <span className="text-lg font-semibold">Refresh Feed</span>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-8">
              Proximity Post &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
