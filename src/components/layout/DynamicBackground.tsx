'use client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const DynamicBackground = () => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLocationAndSetBackground = async () => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        console.warn('Google Maps API key is not configured. Satellite background will not be loaded.');
        setIsLoading(false);
        // Optionally set a default background or do nothing
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Adjust size for better quality if possible, respecting API limits.
            // Max free tier static map size is often 640x640. For larger, check your API plan.
            // Using a size that fits most screens and CSS background-size: cover.
            const width = Math.min(window.innerWidth, 1280); // Capped for performance/API limits
            const height = Math.min(window.innerHeight, 1280);
            
            // Zoom level 9-12 can give a good city/regional satellite view. 50-mile radius is very large.
            // zoom=9 is a wide area.
            const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=9&size=${width}x${height}&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
            setBackgroundImageUrl(mapUrl);
            setIsLoading(false);
          },
          (error) => {
            console.error('Error getting location for background:', error);
            if (error.code === error.PERMISSION_DENIED) {
              toast({
                title: 'Location Access Denied',
                description: 'Satellite background requires location access. You can enable it in your browser settings.',
                variant: 'destructive',
              });
            } else {
              toast({
                title: 'Could Not Get Location',
                description: 'Satellite background based on your location could not be loaded.',
                variant: 'destructive',
              });
            }
            setIsLoading(false);
          }
        );
      } else {
        toast({
          title: 'Geolocation Not Supported',
          description: 'Your browser does not support geolocation. Satellite background cannot be loaded.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchLocationAndSetBackground();
  }, [toast]);

  if (isLoading) {
    // Transparent loading state, or a very subtle placeholder
    return <div className="fixed inset-0 -z-10 bg-transparent" />;
  }

  if (!backgroundImageUrl) {
    // Fallback if API key missing or other non-geo error
    return <div className="fixed inset-0 -z-10 bg-background" />;
  }

  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center transition-all duration-1000 ease-in-out"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      aria-hidden="true"
    />
  );
};

export default DynamicBackground;
