import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  image: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ userId: string }>;
}

// GET /api/v1/users/[userId]
export async function GET(_request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
        portfolios: true,
        _count: {
          select: {
            portfolios: true,
            activities: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/v1/users/[userId]
export async function PATCH(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: validatedData,
      include: {
        _count: {
          select: {
            portfolios: true,
            activities: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: error.issues },
        { status: 400 },
      );
    }

    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, message: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/v1/users/[userId]
export async function DELETE(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    await prisma.user.delete({
      where: { id: params.userId },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete user' }, { status: 500 });
  }
}
