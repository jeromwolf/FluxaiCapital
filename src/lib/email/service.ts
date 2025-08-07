import nodemailer from 'nodemailer';

// Development email configuration (console logging)
const createTestTransporter = () => {
  return nodemailer.createTransporter({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
};

// Production email configuration (SendGrid)
const createProductionTransporter = () => {
  return nodemailer.createTransporter({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = process.env.NODE_ENV === 'production'
      ? createProductionTransporter()
      : createTestTransporter();
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@flux.ai.kr',
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV] Email would be sent:');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Attachments: ${options.attachments?.length || 0}`);
        console.log('---');
        return { success: true, messageId: 'dev-message-id' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Email sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendReportEmail(
    recipient: string, 
    portfolioName: string, 
    reportType: string, 
    pdfBuffer: Buffer
  ): Promise<{ success: boolean; error?: string }> {
    const reportTypeNames: Record<string, string> = {
      daily: '일일 리포트',
      weekly: '주간 리포트', 
      monthly: '월간 리포트',
      performance: '성과 분석 리포트',
    };

    const reportTypeName = reportTypeNames[reportType] || reportType;
    const today = new Date().toLocaleDateString('ko-KR');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FLUX AI Capital 리포트</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
          border-radius: 8px 8px 0 0; 
        }
        .content { 
          background: #f8f9fa; 
          padding: 30px; 
          border-radius: 0 0 8px 8px; 
        }
        .report-info { 
          background: white; 
          padding: 20px; 
          border-radius: 6px; 
          margin: 20px 0; 
          border-left: 4px solid #667eea; 
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          font-size: 0.9em; 
          color: #666; 
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 FLUX AI Capital</h1>
        <p>포트폴리오 리포트</p>
      </div>
      
      <div class="content">
        <h2>안녕하세요! 👋</h2>
        <p>요청하신 포트폴리오 리포트를 전달드립니다.</p>
        
        <div class="report-info">
          <h3>📈 리포트 정보</h3>
          <ul>
            <li><strong>포트폴리오:</strong> ${portfolioName}</li>
            <li><strong>리포트 유형:</strong> ${reportTypeName}</li>
            <li><strong>생성 일자:</strong> ${today}</li>
          </ul>
        </div>

        <p>첨부된 PDF 파일에서 상세한 분석 내용을 확인하실 수 있습니다.</p>
        
        <p>
          <a href="https://flux.ai.kr/dashboard/reports" class="button">
            더 많은 리포트 보기
          </a>
        </p>

        <div class="footer">
          <p>📧 이 이메일은 FLUX AI Capital에서 자동으로 발송되었습니다.</p>
          <p>문의사항이 있으시면 <a href="mailto:support@flux.ai.kr">support@flux.ai.kr</a>로 연락해 주세요.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <small>
            © ${new Date().getFullYear()} FLUX AI Capital. All rights reserved.<br>
            🌐 <a href="https://flux.ai.kr">flux.ai.kr</a>
          </small>
        </div>
      </div>
    </body>
    </html>
    `;

    const result = await this.sendEmail({
      to: recipient,
      subject: `[FLUX AI Capital] ${portfolioName} ${reportTypeName} - ${today}`,
      html,
      attachments: [{
        filename: `${portfolioName}-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    });

    return result;
  }
}

// Singleton instance
export const emailService = new EmailService();