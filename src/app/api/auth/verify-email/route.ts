import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { sendVerificationEmail } from '@/lib/email/verification';
import prisma from '@/lib/prisma';

// POST /api/auth/verify-email - Send verification email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '이메일이 필요합니다.' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: '이미 인증된 이메일입니다.' }, { status: 200 });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: '인증 이메일이 발송되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: '이메일 발송 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// GET /api/auth/verify-email?token=xxx - Verify email with token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: '토큰이 필요합니다.' }, { status: 400 });
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 400 });
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json({ error: '만료된 토큰입니다.' }, { status: 400 });
    }

    // Update user email verification status
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Redirect to success page
    return NextResponse.redirect(new URL('/login?verified=true', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: '이메일 인증 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
