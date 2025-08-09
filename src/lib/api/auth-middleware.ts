import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiKeyManager } from './api-key-manager';

export interface AuthContext {
  type: 'session' | 'api-key';
  userId: string;
  permissions?: string[];
}

/**
 * Middleware to authenticate API requests
 * Supports both session-based auth and API key auth
 */
export async function authenticateRequest(
  req: NextRequest,
): Promise<{ authenticated: boolean; context?: AuthContext; error?: string }> {
  // Check for API key first
  const apiKey =
    req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');

  if (apiKey) {
    const validatedKey = await ApiKeyManager.validateApiKey(apiKey);

    if (!validatedKey) {
      return {
        authenticated: false,
        error: 'Invalid or expired API key',
      };
    }

    return {
      authenticated: true,
      context: {
        type: 'api-key',
        userId: validatedKey.userId,
        permissions: validatedKey.permissions,
      },
    };
  }

  // Fall back to session auth
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authenticated: false,
      error: 'Unauthorized',
    };
  }

  return {
    authenticated: true,
    context: {
      type: 'session',
      userId: session.user.id,
      permissions: ['*'], // Session users have all permissions
    },
  };
}

/**
 * Check if the authenticated context has a specific permission
 */
export function hasPermission(context: AuthContext, permission: string): boolean {
  if (!context.permissions) return false;
  return context.permissions.includes(permission) || context.permissions.includes('*');
}

/**
 * Create an authenticated API route handler
 */
export function withAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>,
  requiredPermission?: string,
) {
  return async (req: NextRequest) => {
    const { authenticated, context, error } = await authenticateRequest(req);

    if (!authenticated || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    if (requiredPermission && !hasPermission(context, requiredPermission)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return handler(req, context);
  };
}
