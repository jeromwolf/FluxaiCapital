import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env["EMAIL_HOST"] || 'smtp.gmail.com',
  port: parseInt(process.env["EMAIL_PORT"] || '587'),
  secure: false,
  auth: {
    user: process.env["EMAIL_USER"],
    pass: process.env["EMAIL_PASSWORD"],
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env["NEXTAUTH_URL"]}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"FLUX AI Capital" <${process.env["EMAIL_FROM"] || 'noreply@flux.ai.kr'}>`,
    to: email,
    subject: '[FLUX AI Capital] 이메일 인증을 완료해주세요',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 30px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FLUX AI Capital</h1>
              <p>이메일 인증</p>
            </div>
            <div class="content">
              <h2>환영합니다!</h2>
              <p>FLUX AI Capital 가입을 진행해주셔서 감사합니다.</p>
              <p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요:</p>
              <center>
                <a href="${verificationUrl}" class="button">이메일 인증하기</a>
              </center>
              <p>또는 아래 링크를 브라우저에 직접 입력하세요:</p>
              <p style="word-break: break-all; font-size: 12px; color: #666;">${verificationUrl}</p>
              <p>이 링크는 24시간 동안 유효합니다.</p>
              <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="font-size: 12px; color: #666;">
                이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 FLUX AI Capital. All rights reserved.</p>
              <p>문의: support@flux.ai.kr</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}