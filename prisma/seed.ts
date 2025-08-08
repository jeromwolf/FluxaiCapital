import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test users with passwords
  const testPassword = await bcrypt.hash('test123', 10)
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)
  
  const testUser = await prisma.user.create({
    data: {
      email: 'test@flux.ai.kr',
      name: '테스트 사용자',
      password: testPassword,
      role: 'USER',
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@flux.ai.kr',
      name: '관리자',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@flux.ai.kr',
      name: '일반 사용자',
      password: userPassword,
      role: 'USER',
    },
  })

  console.log('✅ Created users:', { testUser: testUser.email, adminUser: adminUser.email, normalUser: normalUser.email })

  // Create portfolios
  const mainPortfolio = await prisma.portfolio.create({
    data: {
      userId: testUser.id,
      name: 'AI 성장주 포트폴리오',
      description: 'AI 관련 성장주 중심의 공격적 포트폴리오',
      currency: 'KRW',
      isActive: true,
    },
  })

  const stablePortfolio = await prisma.portfolio.create({
    data: {
      userId: testUser.id,
      name: '안정형 배당주 포트폴리오',
      description: '안정적인 배당 수익을 추구하는 포트폴리오',
      currency: 'KRW',
      isActive: true,
    },
  })

  console.log('✅ Created portfolios:', { 
    mainPortfolio: mainPortfolio.name, 
    stablePortfolio: stablePortfolio.name 
  })

  // Sample stock data
  const holdings = [
    {
      portfolioId: mainPortfolio.id,
      symbol: 'NVDA',
      quantity: new Prisma.Decimal(10),
      averagePrice: new Prisma.Decimal(650000),
      currentPrice: new Prisma.Decimal(750000),
    },
    {
      portfolioId: mainPortfolio.id,
      symbol: 'MSFT',
      quantity: new Prisma.Decimal(20),
      averagePrice: new Prisma.Decimal(450000),
      currentPrice: new Prisma.Decimal(480000),
    },
    {
      portfolioId: mainPortfolio.id,
      symbol: 'GOOGL',
      quantity: new Prisma.Decimal(15),
      averagePrice: new Prisma.Decimal(180000),
      currentPrice: new Prisma.Decimal(195000),
    },
    {
      portfolioId: stablePortfolio.id,
      symbol: '005930', // Samsung Electronics
      quantity: new Prisma.Decimal(100),
      averagePrice: new Prisma.Decimal(70000),
      currentPrice: new Prisma.Decimal(72000),
    },
    {
      portfolioId: stablePortfolio.id,
      symbol: '035420', // NAVER
      quantity: new Prisma.Decimal(30),
      averagePrice: new Prisma.Decimal(200000),
      currentPrice: new Prisma.Decimal(210000),
    },
  ]

  // Create holdings and transactions
  for (const holding of holdings) {
    const marketValue = holding.quantity.mul(holding.currentPrice)
    const cost = holding.quantity.mul(holding.averagePrice)
    const unrealizedPnL = marketValue.sub(cost)

    await prisma.holding.create({
      data: {
        ...holding,
        marketValue,
        unrealizedPnL,
        realizedPnL: new Prisma.Decimal(0),
      },
    })

    // Create buy transaction
    await prisma.transaction.create({
      data: {
        portfolioId: holding.portfolioId,
        type: 'BUY',
        symbol: holding.symbol,
        quantity: holding.quantity,
        price: holding.averagePrice,
        amount: cost,
        fee: cost.mul(0.00015), // 0.015% fee
        executedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      },
    })
  }

  console.log('✅ Created holdings and transactions')

  // Create some historical performance data
  const portfolios = [mainPortfolio, stablePortfolio]
  for (const portfolio of portfolios) {
    let totalValue = 10000000 // Start with 10M KRW
    let cumReturn = 0

    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Simulate daily returns (-3% to +3%)
      const dailyReturn = (Math.random() - 0.5) * 0.06
      totalValue = totalValue * (1 + dailyReturn)
      cumReturn = ((totalValue - 10000000) / 10000000) * 100

      await prisma.performance.create({
        data: {
          portfolioId: portfolio.id,
          date,
          totalValue: new Prisma.Decimal(totalValue.toFixed(0)),
          dailyReturn: new Prisma.Decimal((dailyReturn * 100).toFixed(2)),
          cumReturn: new Prisma.Decimal(cumReturn.toFixed(2)),
        },
      })
    }
  }

  console.log('✅ Created performance history')

  // Create initial activity logs
  await prisma.activity.createMany({
    data: [
      {
        userId: testUser.id,
        type: 'PORTFOLIO_CREATE',
        action: `Created portfolio: ${mainPortfolio.name}`,
        metadata: { portfolioId: mainPortfolio.id },
      },
      {
        userId: testUser.id,
        type: 'PORTFOLIO_CREATE',
        action: `Created portfolio: ${stablePortfolio.name}`,
        metadata: { portfolioId: stablePortfolio.id },
      },
    ],
  })

  console.log('✅ Created activity logs')
  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })