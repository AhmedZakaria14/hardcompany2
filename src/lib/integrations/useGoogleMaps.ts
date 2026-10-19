import { useState, useEffect } from 'react';

interface GoogleMapsLoaderState {
  isLoaded: boolean;
  loadError: string | null;
  apiKey: string | null;
  hasApiKey: boolean;
}

/**
 * Hook for Google Maps Platform Integration
 * Checks for VITE_GOOGLE_MAPS_API_KEY and provides loading state
 */
export function useGoogleMaps(): GoogleMapsLoaderState {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null;
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      // Graceful fallback to default interactive tile map engine
      setIsLoaded(true);
      return;
    }

    // If script is already injected
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setLoadError('Failed to load Google Maps script');
      document.head.appendChild(script);
    } catch (err) {
      setLoadError(String(err));
    }
  }, [apiKey]);

  return {
    isLoaded,
    loadError,
    apiKey,
    hasApiKey: Boolean(apiKey),
  };
}

// Ensure TypeScript recognizes window.google
declare global {
  interface Window {
    google?: any;
  }
}
