import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/security/csrf'

export default withAuth(
  function middleware(req) {
    // Add session validation headers
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // Generate CSRF token if not exists
    const csrfToken = req.cookies.get('csrf-token')?.value
    if (!csrfToken) {
      const newToken = generateCSRFToken()
      response.cookies.set('csrf-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      })
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Protected routes
        const protectedPaths = [
          '/dashboard',
          '/portfolio',
          '/settings',
          '/backtest',
          '/reports',
          '/notifications'
        ]
        const isProtected = protectedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        )
        
        // API routes protection
        const isApiRoute = req.nextUrl.pathname.startsWith('/api/v1')
        const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
        
        if ((isProtected || (isApiRoute && !isAuthRoute)) && !token) {
          return false
        }
        
        // Email verification check
        if (isProtected && token && !token.emailVerified) {
          // Allow access to settings page for email verification
          if (!req.nextUrl.pathname.startsWith('/settings')) {
            return '/settings?verify=email'
          }
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portfolio/:path*',
    '/settings/:path*',
    '/api/v1/portfolios/:path*',
    '/api/v1/users/:path*',
  ],
}