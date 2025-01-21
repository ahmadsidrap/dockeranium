import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withIronSessionApiRoute } from 'next-iron-session'

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next()
  
  // Skip middleware for public paths
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname === '/favicon.ico' ||
    req.nextUrl.pathname === '/login'
  ) {
    return res
  }

  try {
    // Check for session cookie
    const sessionCookie = req.cookies.get('dockeranium_session')
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Clone the headers
    const requestHeaders = new Headers(req.headers)
  
    // Add necessary headers for CORS
    requestHeaders.set('Accept', 'application/json')
    requestHeaders.set('Content-Type', 'application/json')
    requestHeaders.set('Origin', req.headers.get('origin') || 'http://localhost:3000')
    // Return the response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    '/api/:path*',
    '/containers/:path*',
    '/images/:path*',
    '/networks/:path*',
    '/volumes/:path*',
  ],
} 