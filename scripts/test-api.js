const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testReportsAPI() {
  console.log('🧪 Starting Reports API Test...\n');

  try {
    // 1. Test database connection and portfolio data
    console.log('1. Testing database connection...');
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: 'test-portfolio-1' },
      include: {
        user: true,
        holdings: true,
        transactions: {
          orderBy: { executedAt: 'desc' },
          take: 10,
        },
        performances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!portfolio) {
      console.log('❌ Portfolio not found. Running seed first...');
      return;
    }

    console.log('✅ Portfolio found:', portfolio.name);
    console.log(`   Holdings: ${portfolio.holdings.length}`);
    console.log(`   Transactions: ${portfolio.transactions.length}`);
    console.log(`   Performance records: ${portfolio.performances.length}\n`);

    // 2. Test report template generation
    console.log('2. Testing report template generation...');
    const reportTypes = ['daily', 'weekly', 'monthly', 'performance'];
    
    for (const reportType of reportTypes) {
      try {
        const { getReportTemplate } = require('./src/lib/reports/template');
        const template = getReportTemplate(reportType, portfolio);
        console.log(`   ✅ ${reportType}: ${template.title}`);
      } catch (error) {
        console.log(`   ❌ ${reportType}: ${error.message}`);
      }
    }

    // 3. Test PDF generation
    console.log('\n3. Testing PDF generation...');
    try {
      const { generatePDFReport } = require('./src/lib/reports/pdf-generator');
      const pdfBuffer = await generatePDFReport(portfolio, 'daily');
      console.log(`   ✅ PDF generated: ${pdfBuffer.length} bytes`);
    } catch (error) {
      console.log(`   ❌ PDF generation failed: ${error.message}`);
    }

    // 4. Test email service
    console.log('\n4. Testing email service...');
    try {
      const { EmailService } = require('./src/lib/email/service');
      const emailService = new EmailService();
      
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Report',
        html: '<h1>Test Email</h1><p>This is a test email from FLUX AI Capital.</p>',
      });
      
      console.log(`   ✅ Email test: ${result.success ? 'Success' : 'Failed'}`);
      if (result.messageId) {
        console.log(`   Message ID: ${result.messageId}`);
      }
    } catch (error) {
      console.log(`   ❌ Email test failed: ${error.message}`);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testReportsAPI().catch(console.error);