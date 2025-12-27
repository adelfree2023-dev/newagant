import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Get subdomain (e.g. "demo.coreflex.io" -> "demo")
    // For localhost:3000, we might default to a 'demo' or 'test' tenant for dev
    let currentHost;

    if (hostname.includes('localhost')) {
        // Localhost handling:
        // If accessing via "foo.localhost:3000" (needs local DNS setup), subdomain is 'foo'
        // If accessing via "localhost:3001", we might treat it as a main site or specific tenant.
        // For this environment, let's assume valid access is http://subdomain.localhost:3001
        // But browsers don't do subdomains on localhost easily without /etc/hosts.
        // So we will fallback to a query param or a default for testing.
        // Better yet: Let's extract from the URL if possible, or defaulting to "demo" if plain localhost.
        const parts = hostname.split('.');
        if (parts.length > 1 && parts[0] !== 'localhost') {
            currentHost = parts[0];
        } else {
            // Fallback for direct localhost access without subdomain
            // We will set a header 'x-tenant-domain' to 'demo' (or whatever default you want)
            currentHost = 'demo';
        }
    } else {
        // Production (e.g. store.coreflex.io)
        const parts = hostname.split('.');
        currentHost = parts[0];
    }

    // Set the tenant header for backend layout/pages to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-domain', currentHost);

    // You can also rewrite the URL to /_tenants/[domain]/... to handle dynamic routing if structure supports it
    // For now, simply passing the header is enough for API calls in Server Components

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
