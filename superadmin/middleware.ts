import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Public paths that don't require auth
    const publicPaths = ['/login', '/_next', '/favicon.ico', '/api']

    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    // Get token from cookies
    const token = request.cookies.get('superadmin_token')?.value

    // 1. If trying to access protected route without token -> Redirect to Login
    if (!isPublicPath && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // 2. If on login WITH token -> Redirect to Dashboard
    if (request.nextUrl.pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
