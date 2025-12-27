import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Public paths that don't satisfy auth
    const publicPaths = ['/login', '/register', '/forgot-password', '/_next', '/favicon.ico']

    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path) || request.nextUrl.pathname === '/'
    )

    const token = request.cookies.get('token')?.value

    // 1. If trying to access protected route without token -> Redirect to Login
    if (!isPublicPath && !token) {
        const loginUrl = new URL('/', request.url)
        // loginUrl.searchParams.set('from', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // 2. If trying to access Login/Register WITH token -> Redirect to Dashboard
    if (isPublicPath && token && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
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
}
