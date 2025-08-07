import PDFDocument from 'pdfkit';
import { getReportTemplate } from './template';

interface PortfolioData {
  id: string;
  name: string;
  currency: string;
  holdings: Array<{
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    marketValue: number;
    unrealizedPnL: number;
  }>;
  transactions: Array<{
    type: string;
    symbol: string;
    quantity: number;
    price: number;
    amount: number;
    executedAt: Date;
  }>;
  performances: Array<{
    date: Date;
    totalValue: number;
    dailyReturn: number;
    cumReturn: number;
  }>;
}

export async function generatePDFReport(portfolio: PortfolioData, reportType: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Get template data
      const template = getReportTemplate(reportType, portfolio);
      
      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('FLUX AI Capital', 50, 50);
      
      doc.fontSize(18)
         .font('Helvetica')
         .text(template.title, 50, 85);
      
      doc.fontSize(12)
         .text(`Generated: ${new Date().toLocaleDateString('ko-KR')}`, 50, 115)
         .text(`Portfolio: ${portfolio.name}`, 50, 130);

      // Line separator
      doc.moveTo(50, 155)
         .lineTo(550, 155)
         .stroke();

      let yPosition = 180;

      // Executive Summary
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Executive Summary', 50, yPosition);
      
      yPosition += 30;

      template.sections.forEach((section) => {
        // Section title
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(section.title, 50, yPosition);
        
        yPosition += 25;

        // Section content
        doc.fontSize(11)
           .font('Helvetica')
           .text(section.content, 50, yPosition, { width: 500 });
        
        yPosition += 80;

        // Add new page if needed
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
      });

      // Portfolio Holdings Table
      if (portfolio.holdings.length > 0) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Portfolio Holdings', 50, yPosition);
        
        yPosition += 25;

        // Table headers
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Symbol', 50, yPosition)
           .text('Quantity', 120, yPosition)
           .text('Avg Price', 190, yPosition)
           .text('Current', 260, yPosition)
           .text('Market Value', 330, yPosition)
           .text('P&L', 420, yPosition);
        
        yPosition += 20;

        // Table rows
        doc.font('Helvetica');
        portfolio.holdings.forEach((holding) => {
          const pnlColor = Number(holding.unrealizedPnL) >= 0 ? 'green' : 'red';
          
          doc.text(holding.symbol, 50, yPosition)
             .text(Number(holding.quantity).toFixed(2), 120, yPosition)
             .text(`${Number(holding.averagePrice).toFixed(2)}`, 190, yPosition)
             .text(`${Number(holding.currentPrice).toFixed(2)}`, 260, yPosition)
             .text(`${Number(holding.marketValue).toLocaleString()}`, 330, yPosition);
          
          // P&L with color (note: PDFKit doesn't support colors easily, so we'll use text)
          const pnlText = `${Number(holding.unrealizedPnL) >= 0 ? '+' : ''}${Number(holding.unrealizedPnL).toFixed(2)}`;
          doc.text(pnlText, 420, yPosition);
          
          yPosition += 15;
          
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
        });
      }

      // Performance Chart (simplified text representation)
      if (portfolio.performances.length > 0) {
        yPosition += 30;
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Recent Performance', 50, yPosition);
        
        yPosition += 25;

        portfolio.performances.slice(0, 10).forEach((perf) => {
          doc.fontSize(10)
             .font('Helvetica')
             .text(perf.date.toLocaleDateString('ko-KR'), 50, yPosition)
             .text(`Value: ${Number(perf.totalValue).toLocaleString()}`, 150, yPosition)
             .text(`Daily: ${Number(perf.dailyReturn).toFixed(2)}%`, 280, yPosition)
             .text(`Cum: ${Number(perf.cumReturn).toFixed(2)}%`, 380, yPosition);
          
          yPosition += 15;
          
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
        });
      }

      // Footer
      doc.fontSize(8)
         .font('Helvetica')
         .text('FLUX AI Capital - Confidential', 50, 750)
         .text('Page 1', 500, 750);

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}