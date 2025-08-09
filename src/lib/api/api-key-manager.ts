import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  hashedKey?: string;
  userId: string;
  permissions: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyInput {
  name: string;
  userId: string;
  permissions: string[];
  expiresIn?: number; // hours
}

export class ApiKeyManager {
  private static readonly PREFIX = 'fluxai_';
  private static readonly KEY_LENGTH = 32;

  /**
   * Generate a new API key
   */
  static generateApiKey(): string {
    const randomBytes = crypto.randomBytes(this.KEY_LENGTH);
    const key = randomBytes.toString('base64url');
    return `${this.PREFIX}${key}`;
  }

  /**
   * Hash an API key for storage
   */
  static hashApiKey(key: string): string {
    return crypto
      .createHash('sha256')
      .update(key)
      .digest('hex');
  }

  /**
   * Create a new API key
   */
  static async createApiKey(input: CreateApiKeyInput): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = this.generateApiKey();
    const hashedKey = this.hashApiKey(plainKey);

    const expiresAt = input.expiresIn
      ? new Date(Date.now() + input.expiresIn * 60 * 60 * 1000)
      : undefined;

    const apiKey = await prisma.apiKey.create({
      data: {
        name: input.name,
        hashedKey,
        userId: input.userId,
        permissions: input.permissions,
        expiresAt,
      },
    });

    return {
      apiKey: {
        ...apiKey,
        key: plainKey, // Return plain key only during creation
        permissions: apiKey.permissions as string[],
      },
      plainKey,
    };
  }

  /**
   * Validate an API key
   */
  static async validateApiKey(key: string): Promise<ApiKey | null> {
    if (!key || !key.startsWith(this.PREFIX)) {
      return null;
    }

    const hashedKey = this.hashApiKey(key);

    const apiKey = await prisma.apiKey.findUnique({
      where: { hashedKey },
      include: { user: true },
    });

    if (!apiKey) {
      return null;
    }

    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      ...apiKey,
      key: '***', // Don't return the actual key
      permissions: apiKey.permissions as string[],
    };
  }

  /**
   * List API keys for a user
   */
  static async listApiKeys(userId: string): Promise<ApiKey[]> {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys.map(key => ({
      ...key,
      key: '***', // Don't return the actual key
      permissions: key.permissions as string[],
    }));
  }

  /**
   * Revoke an API key
   */
  static async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    try {
      await prisma.apiKey.delete({
        where: {
          id: keyId,
          userId, // Ensure user owns the key
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update API key permissions
   */
  static async updateApiKeyPermissions(
    keyId: string,
    userId: string,
    permissions: string[]
  ): Promise<ApiKey | null> {
    try {
      const apiKey = await prisma.apiKey.update({
        where: {
          id: keyId,
          userId, // Ensure user owns the key
        },
        data: { permissions },
      });

      return {
        ...apiKey,
        key: '***',
        permissions: apiKey.permissions as string[],
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if an API key has a specific permission
   */
  static hasPermission(apiKey: ApiKey, permission: string): boolean {
    return apiKey.permissions.includes(permission) || apiKey.permissions.includes('*');
  }

  /**
   * Get API key usage statistics
   */
  static async getApiKeyStats(keyId: string, userId: string) {
    // In a real implementation, you would track API calls in a separate table
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      return null;
    }

    // Mock statistics for now
    return {
      totalRequests: Math.floor(Math.random() * 10000),
      requestsToday: Math.floor(Math.random() * 100),
      requestsThisMonth: Math.floor(Math.random() * 1000),
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
    };
  }
}

// Available permissions
export const API_PERMISSIONS = {
  READ_PORTFOLIO: 'portfolio:read',
  WRITE_PORTFOLIO: 'portfolio:write',
  READ_TRADES: 'trades:read',
  WRITE_TRADES: 'trades:write',
  READ_ANALYTICS: 'analytics:read',
  READ_MARKET_DATA: 'market:read',
  ADMIN: '*',
} as const;

export type ApiPermission = typeof API_PERMISSIONS[keyof typeof API_PERMISSIONS];