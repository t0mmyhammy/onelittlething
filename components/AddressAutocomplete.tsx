'use client';

import { useEffect, useRef } from 'react';

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
    initAutocomplete?: () => void;
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter address",
  className = ""
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
    } else {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeAutocomplete();
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' } // Restrict to US addresses
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();

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
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}
