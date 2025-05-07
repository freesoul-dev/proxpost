
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { CreatePostDialog } from '@/components/posts/create-post-dialog';
import { getCurrentLocation } from '@/services/location';
import type { Location } from '@/services/location';
import { MapPin, RefreshCw, Menu, XIcon, PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function BottomActionBar() {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const fetchLocation = useCallback(async () => {
    setIsFetchingLocation(true);
    setLocationError(null);
    try {
      const loc = await getCurrentLocation();
      // Check if it's the default location or an actual one
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
    if (isMobile) setIsSheetOpen(false); // Close sheet after action on mobile
  };

  const renderLocationDisplay = () => {
    if (isFetchingLocation) {
      return <Skeleton className="h-5 w-40 bg-muted/50" />;
    }
    if (locationError) {
      return <span className="text-xs text-destructive-foreground/80">{locationError}</span>;
    }
    if (location) {
      return (
        <span className="text-xs">
          Lat: {location.lat.toFixed(3)}, Lng: {location.lng.toFixed(3)}
        </span>
      );
    }
    return <span className="text-xs text-muted-foreground">Location unavailable</span>;
  };
  
  const commonButtons = (
    <>
      <CreatePostDialog>
        <Button variant="ghost" size="sm" className="flex-col h-auto p-1 hover:bg-accent/20" onClick={() => {if (isMobile) setIsSheetOpen(false)}}>
          <PlusCircle className="h-5 w-5 mb-0.5" />
          <span className="text-xs">Post</span>
        </Button>
      </CreatePostDialog>
      <Button variant="ghost" size="sm" onClick={handleRefreshFeed} className="flex-col h-auto p-1 hover:bg-accent/20">
        <RefreshCw className="h-5 w-5 mb-0.5" />
        <span className="text-xs">Refresh</span>
      </Button>
    </>
  );


  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            className="fixed bottom-4 right-4 z-50 h-14 w-14 shadow-xl bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Menu className="h-6 w-6" />
             <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
            side="bottom" 
            className="z-50 bg-background/80 dark:bg-background/70 backdrop-blur-md border-t border-white/20 dark:border-white/10 text-foreground p-4"
            style={{height: 'auto'}} // Adjust height as needed
            >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center text-lg">Actions</SheetTitle>
             <SheetClose className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <XIcon className="h-5 w-5" />
                <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 p-2 border border-white/10 bg-black/10 rounded-md">
              <MapPin className="h-4 w-4 text-accent" />
              {renderLocationDisplay()}
            </div>
            <div className="flex justify-around w-full">
             {commonButtons}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed bar at the bottom
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-white/20 dark:border-white/10 bg-background/70 dark:bg-background/50 backdrop-blur-md shadow-lg">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-accent" />
          {renderLocationDisplay()}
        </div>
        <div className="flex items-center space-x-2">
          {commonButtons}
        </div>
      </div>
    </div>
  );
}
