import { UserRole, ActivityType } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export type CreateUserInput = {
  email: string;
  name?: string;
  image?: string;
  role?: UserRole;
};

export type UpdateUserInput = {
  name?: string;
  image?: string;
  emailVerified?: Date;
};

export const userService = {
  // Create a new user
  async create(data: CreateUserInput) {
    return await prisma.user.create({
      data,
    });
  },

  // Get user by ID
  async getById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            portfolios: true,
            activities: true,
          },
        },
      },
    });
  },

  // Get user by email
  async getByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  // Update user
  async update(id: string, data: UpdateUserInput) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  // Delete user
  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  },

  // Log user activity
  async logActivity(
    userId: string,
    type: ActivityType,
    action: string,
    metadata?: any,
    request?: {
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    return await prisma.activity.create({
      data: {
        userId,
        type,
        action,
        metadata,
        ipAddress: request?.ipAddress,
        userAgent: request?.userAgent,
      },
    });
  },

  // Get user activities
  async getActivities(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: ActivityType;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const where: any = { userId };

    if (options?.type) where.type = options.type;
    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    return await prisma.activity.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  },

  // Get all users (admin only)
  async getAll(options?: { limit?: number; offset?: number; role?: UserRole }) {
    const where: any = {};
    if (options?.role) where.role = options.role;

    return await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            portfolios: true,
            activities: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: options?.limit,
      skip: options?.offset,
    });
  },
};
