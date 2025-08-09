import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiKeyManager } from '@/lib/api/api-key-manager';
import { AuditLogger } from '@/lib/security/audit';

interface RouteParams {
  params: {
    keyId: string;
  };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await ApiKeyManager.getApiKeyStats(params.keyId, session.user.id);

    if (!stats) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Failed to get API key stats:', error);
    return NextResponse.json({ error: 'Failed to get API key stats' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { permissions } = body;

    if (!permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Invalid permissions' }, { status: 400 });
    }

    const updatedKey = await ApiKeyManager.updateApiKeyPermissions(
      params.keyId,
      session.user.id,
      permissions,
    );

    if (!updatedKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await AuditLogger.log({
      userId: session.user.id,
      action: 'UPDATE_API_KEY',
      resource: 'api_keys',
      resourceId: params.keyId,
      metadata: { permissions },
    });

    return NextResponse.json({ apiKey: updatedKey });
  } catch (error) {
    console.error('Failed to update API key:', error);
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await ApiKeyManager.revokeApiKey(params.keyId, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await AuditLogger.log({
      userId: session.user.id,
      action: 'REVOKE_API_KEY',
      resource: 'api_keys',
      resourceId: params.keyId,
    });

    return NextResponse.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}
