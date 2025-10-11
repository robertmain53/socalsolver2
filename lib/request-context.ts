import { headers } from 'next/headers';
import { SITE_CONFIG } from './seo';

/**
 * Resolve the request origin (protocol + host) using forwarded headers.
 * Falls back to the canonical site URL when rendered at build time.
 */
export function getRequestOrigin(): string {
  try {
    const headersList = headers();
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    if (!host) {
      return SITE_CONFIG.url;
    }

    const protocol = headersList.get('x-forwarded-proto') ?? 'https';
    return `${protocol}://${host}`;
  } catch (_error) {
    // headers() is unavailable during static rendering (build time)
    return SITE_CONFIG.url;
  }
}
