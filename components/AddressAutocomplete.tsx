'use client';

import { useEffect, useRef, useState } from 'react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: {
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter address",
  className = ""
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // If no API key, fall back to regular input
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setError('No API key configured');
      return;
    }

    // Check if already loaded
    if (window.google?.maps?.places?.PlaceAutocompleteElement) {
      initializeAutocomplete();
      return;
    }

    // Load Google Maps script with new Places library
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Define callback
    (window as any).initMap = () => {
      setIsLoaded(true);
      initializeAutocomplete();
    };

    script.onerror = () => {
      setError('Failed to load Google Maps. Check your API key and billing settings.');
    };

    document.head.appendChild(script);

    return () => {
      delete (window as any).initMap;
      try {
        document.head.removeChild(script);
      } catch (e) {
        // Script may have already been removed
      }
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!containerRef.current || !window.google?.maps?.places?.PlaceAutocompleteElement) {
      return;
    }

    try {
      // Clear existing content
      containerRef.current.innerHTML = '';

      // Create new PlaceAutocompleteElement
      const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address'],
      });

      // Add event listener
      autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
        const place = event.place;

        if (!place.address_components) return;

        // Extract address components
        let street_number = '';
        let route = '';
        let city = '';
        let state = '';
        let zip_code = '';
        let country = '';

        place.address_components.forEach((component: any) => {
          const types = component.types;

          if (types.includes('street_number')) {
            street_number = component.long_name;
          }
          if (types.includes('route')) {
            route = component.long_name;
          }
          if (types.includes('locality')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.short_name;
          }
          if (types.includes('postal_code')) {
            zip_code = component.long_name;
          }
          if (types.includes('country')) {
            country = component.long_name;
          }
        });

        const street_address = `${street_number} ${route}`.trim();
        const formatted_address = place.formatted_address || '';

        // Update the input value
        onChange(formatted_address);

        // Call the callback with structured data
        if (onAddressSelect) {
          onAddressSelect({
            street_address,
            city,
            state,
            zip_code,
            country
          });
        }
      });

      containerRef.current.appendChild(autocompleteElement);
      setIsLoaded(true);
    } catch (err) {
      console.error('Autocomplete initialization error:', err);
      setError('Failed to initialize autocomplete');
    }
  };

  // Fallback to regular input if there's an error or no API key
  if (error) {
    return (
      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
        <p className="text-xs text-amber-600 mt-1">
          Address autocomplete unavailable. Using manual entry.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
}
