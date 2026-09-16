'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track if we are in the browser
    if (typeof window === 'undefined') return;

    // Optional: Ignore admin routes if you don't want to track admins
    if (pathname?.startsWith('/admin')) return;

    // Send tracking ping
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: pathname }),
    }).catch((err) => {
      // Silently fail to not disrupt user experience
      console.error('Tracking failed', err);
    });

  }, [pathname]);

  return null; // Invisible component
}
