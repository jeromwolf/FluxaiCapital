import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// Validation schema
const createHoldingSchema = z.object({
  symbol: z.string().min(1).max(20),
  quantity: z.number().positive(),
  averagePrice: z.number().positive(),
  currentPrice: z.number().positive(),
})


interface RouteParams {
  params: Promise<{ portfolioId: string }>
}

// GET /api/v1/portfolios/[portfolioId]/holdings
export async function GET(_request: NextRequest, props: RouteParams) {
  const params = await props.params
  try {
    const holdings = await prisma.holding.findMany({
      where: { portfolioId: params.portfolioId },
      orderBy: { marketValue: 'desc' }
    })
    
    // Calculate portfolio summary
    const totalValue = holdings.reduce(
      (sum, holding) => sum + Number(holding.marketValue),
      0
    )
    
    const totalCost = holdings.reduce(
      (sum, holding) => sum + (Number(holding.quantity) * Number(holding.averagePrice)),
      0
    )
    
    const totalUnrealizedPnL = holdings.reduce(
      (sum, holding) => sum + Number(holding.unrealizedPnL),
      0
    )
    
    // Add weight percentage to each holding
    const holdingsWithWeight = holdings.map(holding => ({
      ...holding,
      weight: totalValue > 0 ? (Number(holding.marketValue) / totalValue) * 100 : 0,
      quantity: Number(holding.quantity),
      averagePrice: Number(holding.averagePrice),
      currentPrice: Number(holding.currentPrice),
      marketValue: Number(holding.marketValue),
      realizedPnL: Number(holding.realizedPnL),
      unrealizedPnL: Number(holding.unrealizedPnL),
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        holdings: holdingsWithWeight,
        summary: {
          totalValue,
          totalCost,
          totalUnrealizedPnL,
          totalReturn: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
          holdingsCount: holdings.length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching holdings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch holdings' },
      { status: 500 }
    )
  }
}

// POST /api/v1/portfolios/[portfolioId]/holdings
export async function POST(request: NextRequest, props: RouteParams) {
  const params = await props.params
  try {
    const body = await request.json()
    const validatedData = createHoldingSchema.parse(body)
    
    // Check if portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: params.portfolioId }
    })
    
    if (!portfolio) {
      return NextResponse.json(
        { success: false, message: 'Portfolio not found' },
        { status: 404 }
      )
    }
    
    // Calculate market value and unrealized PnL
    const marketValue = validatedData.quantity * validatedData.currentPrice
    const cost = validatedData.quantity * validatedData.averagePrice
    const unrealizedPnL = marketValue - cost
    
    // Check if holding already exists
    const existingHolding = await prisma.holding.findUnique({
      where: {
        portfolioId_symbol: {
          portfolioId: params.portfolioId,
          symbol: validatedData.symbol
        }
      }
    })
    
    if (existingHolding) {
      // Update existing holding (add to position)
      const newQuantity = Number(existingHolding.quantity) + validatedData.quantity
      const newTotalCost = Number(existingHolding.quantity) * Number(existingHolding.averagePrice) + cost
      const newAveragePrice = newTotalCost / newQuantity
      const newMarketValue = newQuantity * validatedData.currentPrice
      const newUnrealizedPnL = newMarketValue - newTotalCost
      
      const holding = await prisma.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: new Decimal(newQuantity),
          averagePrice: new Decimal(newAveragePrice),
          currentPrice: new Decimal(validatedData.currentPrice),
          marketValue: new Decimal(newMarketValue),
          unrealizedPnL: new Decimal(newUnrealizedPnL)
        }
      })
      
      return NextResponse.json({ success: true, data: holding })
    }
    
    // Create new holding
    const holding = await prisma.holding.create({
      data: {
        portfolioId: params.portfolioId,
        symbol: validatedData.symbol,
        quantity: new Decimal(validatedData.quantity),
        averagePrice: new Decimal(validatedData.averagePrice),
        currentPrice: new Decimal(validatedData.currentPrice),
        marketValue: new Decimal(marketValue),
        unrealizedPnL: new Decimal(unrealizedPnL),
        realizedPnL: new Decimal(0)
      }
    })
    
    // Create transaction record
    await prisma.transaction.create({
      data: {
        portfolioId: params.portfolioId,
        type: 'BUY',
        symbol: validatedData.symbol,
        quantity: new Decimal(validatedData.quantity),
        price: new Decimal(validatedData.averagePrice),
        amount: new Decimal(cost),
        fee: new Decimal(0)
      }
    })
    
    return NextResponse.json(
      { success: true, data: holding },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating holding:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create holding' },
      { status: 500 }
    )
  }
}