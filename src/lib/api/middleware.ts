import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/security/csrf';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export type ApiHandler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse> | NextResponse;

interface MiddlewareOptions {
  requireAuth?: boolean;
  validateCSRF?: boolean;
}

export function withApiMiddleware(
  handler: ApiHandler,
  options: MiddlewareOptions = {}
) {
  const { requireAuth = true, validateCSRF = true } = options;
  
  return async (req: NextRequest, context?: any) => {
    try {
      // Validate CSRF token for non-GET requests
      if (validateCSRF && req.method !== 'GET') {
        const isValid = await validateCSRFToken(req);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          );
        }
      }
      
      // Validate authentication
      if (requireAuth) {
        const session = await getServerSession(authOptions);
        if (!session) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
        
        // Add user to request context
        if (context) {
          context.user = session.user;
        }
      }
      
      // Call the actual handler
      return await handler(req, context);
      
    } catch (error) {
      console.error('API Middleware Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}