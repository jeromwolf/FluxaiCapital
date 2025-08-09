import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiKeyManager, API_PERMISSIONS } from '@/lib/api/api-key-manager';
import { auditLog } from '@/lib/security/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = await ApiKeyManager.listApiKeys(session.user.id);

    await auditLog({
      userId: session.user.id,
      action: 'VIEW_API_KEYS',
      resource: 'api_keys',
      metadata: { count: apiKeys.length }
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Failed to list API keys:', error);
    return NextResponse.json(
      { error: 'Failed to list API keys' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, permissions, expiresIn } = body;

    // Validate input
    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    // Validate permissions
    const validPermissions = Object.values(API_PERMISSIONS);
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { error: 'Invalid permissions', invalidPermissions },
        { status: 400 }
      );
    }

    const { apiKey, plainKey } = await ApiKeyManager.createApiKey({
      name,
      userId: session.user.id,
      permissions,
      expiresIn,
    });

    await auditLog({
      userId: session.user.id,
      action: 'CREATE_API_KEY',
      resource: 'api_keys',
      resourceId: apiKey.id,
      metadata: { name, permissions }
    });

    return NextResponse.json({
      apiKey: {
        ...apiKey,
        key: plainKey, // Only return plain key on creation
      },
      message: 'Save this API key securely. You won\'t be able to see it again.',
    });
  } catch (error) {
    console.error('Failed to create API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}