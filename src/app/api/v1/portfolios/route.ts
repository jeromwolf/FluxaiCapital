import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const createPortfolioSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  currency: z.string().default('KRW'),
  isActive: z.boolean().default(true),
})

// GET /api/v1/portfolios
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const isActive = searchParams.get('isActive')
    
    const where: any = {}
    if (userId) where.userId = userId
    if (isActive !== null) where.isActive = isActive === 'true'
    
    const portfolios = await prisma.portfolio.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        holdings: true,
        _count: {
          select: {
            holdings: true,
            transactions: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: portfolios })
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch portfolios' },
      { status: 500 }
    )
  }
}

// POST /api/v1/portfolios
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPortfolioSchema.parse(body)
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }
    
    const portfolio = await prisma.portfolio.create({
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        _count: {
          select: {
            holdings: true,
            transactions: true,
          }
        }
      }
    })
    
    // Log activity
    await prisma.activity.create({
      data: {
        userId: validatedData.userId,
        type: 'PORTFOLIO_CREATE',
        action: `Created portfolio: ${portfolio.name}`,
        metadata: { portfolioId: portfolio.id }
      }
    })
    
    return NextResponse.json(
      { success: true, data: portfolio },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating portfolio:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create portfolio' },
      { status: 500 }
    )
  }
}