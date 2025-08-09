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
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Create a new API key
   */
  static async createApiKey(
    input: CreateApiKeyInput,
  ): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = this.generateApiKey();
    const hashedKey = this.hashApiKey(plainKey);

    const expiresAt = input.expiresIn
      ? new Date(Date.now() + input.expiresIn * 60 * 60 * 1000)
      : undefined;

    // TODO: Add ApiKey model to Prisma schema
    // const apiKey = await prisma.apiKey.create({
    //   data: {
    //     name: input.name,
    //     hashedKey,
    //     userId: input.userId,
    //     permissions: input.permissions,
    //     expiresAt,
    //   },
    // });

    // Mock response until Prisma model is created
    const apiKey = {
      id: crypto.randomUUID(),
      name: input.name,
      hashedKey,
      userId: input.userId,
      permissions: input.permissions,
      expiresAt,
      lastUsedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: plainKey, // Return plain key only during creation
        hashedKey: apiKey.hashedKey,
        userId: apiKey.userId,
        permissions: Array.isArray(apiKey.permissions) ? (apiKey.permissions as string[]) : [],
        expiresAt: apiKey.expiresAt,
        lastUsedAt: apiKey.lastUsedAt,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
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

    // TODO: Add ApiKey model to Prisma schema
    // Mock validation for now
    return {
      id: crypto.randomUUID(),
      name: 'Mock API Key',
      key: '***', // Don't return the actual key
      hashedKey: this.hashApiKey(key),
      userId: 'mock-user-id',
      permissions: ['portfolio:read', 'trades:read'],
      expiresAt: undefined,
      lastUsedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * List API keys for a user
   */
  static async listApiKeys(userId: string): Promise<ApiKey[]> {
    // TODO: Add ApiKey model to Prisma schema
    // Mock data for now
    return [];
  }

  /**
   * Revoke an API key
   */
  static async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    // TODO: Add ApiKey model to Prisma schema
    // Mock response for now
    return true;
  }

  /**
   * Update API key permissions
   */
  static async updateApiKeyPermissions(
    keyId: string,
    userId: string,
    permissions: string[],
  ): Promise<ApiKey | null> {
    // TODO: Add ApiKey model to Prisma schema
    // Mock response for now
    return {
      id: keyId,
      name: 'Mock API Key',
      key: '***',
      hashedKey: 'mock-hash',
      userId,
      permissions,
      expiresAt: undefined,
      lastUsedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
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
  static async getApiKeyStats(
    keyId: string,
    userId: string,
  ): Promise<{
    totalRequests: number;
    requestsToday: number;
    requestsThisMonth: number;
    lastUsedAt: Date | null;
    createdAt: Date;
  } | null> {
    // TODO: Add ApiKey model to Prisma schema
    // Mock statistics for now
    return {
      totalRequests: Math.floor(Math.random() * 10000),
      requestsToday: Math.floor(Math.random() * 100),
      requestsThisMonth: Math.floor(Math.random() * 1000),
      lastUsedAt: new Date(),
      createdAt: new Date(),
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

export type ApiPermission = (typeof API_PERMISSIONS)[keyof typeof API_PERMISSIONS];
