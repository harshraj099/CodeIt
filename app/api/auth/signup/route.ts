import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateOTP } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Create transporter only if SMTP credentials are available
function getTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Step 1: Request OTP
export async function POST(request: NextRequest) {
  try {
    const { email, username, password, step, otp } = await request.json();

    if (!email || !username) {
      return NextResponse.json(
        { error: 'Email and username are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Step 1: Request OTP
    if (step === 'request-otp') {
      // Check if user already exists (only in request-otp step)
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username },
          ],
        },
      });

      if (existingUser && existingUser.password && !existingUser.otp) {
        // User exists and is fully registered (has password, no pending OTP)
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required' },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const hashedPassword = await hashPassword(password);

      // Update or create user with OTP and hashed password
      await prisma.user.upsert({
        where: { email },
        update: {
          otp: otpCode,
          otpExpires,
          username,
          password: hashedPassword, // Store hashed password temporarily
        },
        create: {
          email,
          username,
          otp: otpCode,
          otpExpires,
          password: hashedPassword, // Store hashed password
        },
      });

      // Send OTP email
      let emailSent = false;
      const transporter = getTransporter();

      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Your OTP for LLD Pad Signup',
            text: `Your OTP code is: ${otpCode}. This code will expire in 10 minutes.`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to LLD Pad!</h2>
                <p>Your OTP code is: <strong style="font-size: 24px; color: #3b82f6;">${otpCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
            `,
          });
          emailSent = true;
          console.log(`[EMAIL] OTP sent to ${email}`);
        } catch (emailError: any) {
          console.error('Error sending email:', emailError);
          // In production, fail if email can't be sent
          if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
              { error: `Failed to send OTP email: ${emailError.message || 'Unknown error'}` },
              { status: 500 }
            );
          }
        }
      } else {
        // Development mode: log OTP to console
        console.log(`\n========================================`);
        console.log(`[DEV MODE] OTP for ${email}: ${otpCode}`);
        console.log(`========================================\n`);
      }

      // Always return OTP in development, or if email failed in dev mode
      const isDev = process.env.NODE_ENV !== 'production';
      return NextResponse.json({
        success: true,
        message: emailSent 
          ? 'OTP sent to your email' 
          : isDev 
            ? 'OTP generated (check console or use the OTP below)' 
            : 'OTP sent to your email',
        // Always return OTP in development or if email wasn't sent
        ...((isDev || !emailSent) && { otp: otpCode }),
      });
    }

    // Step 2: Verify OTP and complete signup
    if (step === 'verify-otp' && otp) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.otp || !user.otpExpires) {
        return NextResponse.json(
          { error: 'OTP not found or expired. Please request a new OTP.' },
          { status: 400 }
        );
      }

      if (user.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }

      if (new Date() > user.otpExpires) {
        return NextResponse.json(
          { error: 'OTP expired. Please request a new OTP.' },
          { status: 400 }
        );
      }

      // Password is already stored (hashed) from step 1
      // Just clear the OTP fields to complete signup
      await prisma.user.update({
        where: { email },
        data: {
          otp: null,
          otpExpires: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Account created successfully! Redirecting to login...',
      });
    }

    return NextResponse.json(
      { error: 'Invalid step or missing OTP' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to signup' },
      { status: 500 }
    );
  }
}

