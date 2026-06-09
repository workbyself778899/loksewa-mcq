'use client';

// Prevent static generation for admin routes
export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';

/**
 * Admin Layout
 * Ensures admin pages have proper context and are not statically generated
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
