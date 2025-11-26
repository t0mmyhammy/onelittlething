import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OneLittleThing',
    short_name: 'OneLittleThing',
    description: 'Capture one moment about your child each day. Build a private timeline of memories that matter.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#FDF8F4',
    theme_color: '#8B9A7D',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
