const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스 시드 데이터 생성 중...');

  // 개발자 사용자 생성
  const devUser = await prisma.user.upsert({
    where: { email: 'dev@flux.ai.kr' },
    update: {},
    create: {
      id: 'dev-user-123',
      email: 'dev@flux.ai.kr',
      name: '개발자',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('✅ 개발자 사용자 생성:', devUser.email);

  // 테스트 포트폴리오 생성
  const testPortfolio = await prisma.portfolio.upsert({
    where: { id: 'test-portfolio-1' },
    update: {},
    create: {
      id: 'test-portfolio-1',
      userId: devUser.id,
      name: '성장주 포트폴리오',
      description: '고성장 기술주 중심의 테스트 포트폴리오',
      currency: 'KRW',
      isActive: true,
    },
  });

  console.log('✅ 테스트 포트폴리오 생성:', testPortfolio.name);

  // 테스트 보유 자산 생성
  const holdings = [
    {
      portfolioId: testPortfolio.id,
      symbol: 'AAPL',
      quantity: 100,
      averagePrice: 150.0,
      currentPrice: 175.0,
      marketValue: 17500.0,
      realizedPnL: 0,
      unrealizedPnL: 2500.0,
    },
    {
      portfolioId: testPortfolio.id,
      symbol: 'GOOGL',
      quantity: 50,
      averagePrice: 2800.0,
      currentPrice: 2900.0,
      marketValue: 145000.0,
      realizedPnL: 0,
      unrealizedPnL: 5000.0,
    },
    {
      portfolioId: testPortfolio.id,
      symbol: 'TSLA',
      quantity: 25,
      averagePrice: 800.0,
      currentPrice: 850.0,
      marketValue: 21250.0,
      realizedPnL: 0,
      unrealizedPnL: 1250.0,
    },
  ];

  for (const holding of holdings) {
    await prisma.holding.upsert({
      where: {
        portfolioId_symbol: {
          portfolioId: holding.portfolioId,
          symbol: holding.symbol,
        },
      },
      update: { ...holding },
      create: { ...holding },
    });
  }

  console.log('✅ 테스트 보유 자산 생성 완료');

  // 테스트 거래 내역 생성
  const transactions = [
    {
      portfolioId: testPortfolio.id,
      type: 'BUY',
      symbol: 'AAPL',
      quantity: 100,
      price: 150.0,
      amount: 15000.0,
      fee: 15.0,
      notes: '초기 매수',
      executedAt: new Date('2024-01-01'),
    },
    {
      portfolioId: testPortfolio.id,
      type: 'BUY',
      symbol: 'GOOGL',
      quantity: 50,
      price: 2800.0,
      amount: 140000.0,
      fee: 140.0,
      notes: '초기 매수',
      executedAt: new Date('2024-01-02'),
    },
    {
      portfolioId: testPortfolio.id,
      type: 'BUY',
      symbol: 'TSLA',
      quantity: 25,
      price: 800.0,
      amount: 20000.0,
      fee: 20.0,
      notes: '초기 매수',
      executedAt: new Date('2024-01-03'),
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log('✅ 테스트 거래 내역 생성 완료');

  // 성과 데이터 생성 (최근 30일)
  const today = new Date();
  const performances = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseValue = 180000; // 기준 포트폴리오 가치
    const randomReturn = (Math.random() - 0.5) * 0.04; // -2% ~ +2% 랜덤 일일 수익률
    const totalValue = baseValue * (1 + (30 - i) * 0.001 + randomReturn); // 전체적으로 상승 추세
    const dailyReturn = i === 30 ? 0 : randomReturn * 100;
    const cumReturn = ((totalValue - baseValue) / baseValue) * 100;
    
    performances.push({
      portfolioId: testPortfolio.id,
      date: date,
      totalValue: totalValue,
      dailyReturn: dailyReturn,
      cumReturn: cumReturn,
    });
  }

  for (const performance of performances) {
    await prisma.performance.upsert({
      where: {
        portfolioId_date: {
          portfolioId: performance.portfolioId,
          date: performance.date,
        },
      },
      update: { ...performance },
      create: { ...performance },
    });
  }

  console.log('✅ 테스트 성과 데이터 생성 완료');

  // 활동 로그 생성
  await prisma.activity.create({
    data: {
      userId: devUser.id,
      type: 'PORTFOLIO_CREATE',
      action: '포트폴리오 생성',
      metadata: { portfolioId: testPortfolio.id },
      ipAddress: '127.0.0.1',
      userAgent: 'Development Seed',
    },
  });

  console.log('✅ 활동 로그 생성 완료');

  console.log('');
  console.log('🎉 시드 데이터 생성이 완료되었습니다!');
  console.log('');
  console.log('생성된 데이터:');
  console.log(`- 사용자: ${devUser.email}`);
  console.log(`- 포트폴리오: ${testPortfolio.name}`);
  console.log(`- 보유 자산: ${holdings.length}개`);
  console.log(`- 거래 내역: ${transactions.length}개`);
  console.log(`- 성과 데이터: ${performances.length}개`);
  console.log('');
  console.log('이제 애플리케이션에서 실제 데이터를 확인할 수 있습니다! 🚀');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });