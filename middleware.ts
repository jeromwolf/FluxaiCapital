import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Protected routes
        const protectedPaths = ['/dashboard', '/portfolio', '/settings']
        const isProtected = protectedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        )
        
        if (isProtected && !token) {
          return false
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