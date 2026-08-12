import { NextRequest, NextResponse } from 'next/server';
import { stytchVerifyOTP } from '@/lib/auth-providers';
import { db } from '@/lib/db';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'tf_auth_session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { methodId, code } = body;

    if (!methodId || !code) {
      return NextResponse.json(
        { success: false, error: 'Le methodId et le code sont requis.' },
        { status: 400 },
      );
    }

    const result = await stytchVerifyOTP(methodId, code);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        userId: null,
        error: result.error || 'Échec de la vérification du code OTP.',
      });
    }

    // Find the Stytch provider
    const authProvider = await db.authProvider.findUnique({
      where: { provider: 'stytch' },
    });

    if (!authProvider) {
      return NextResponse.json({
        success: false,
        userId: null,
        error: 'Fournisseur Stytch non configuré.',
      });
    }

    const providerUserId = result.userId || crypto.randomUUID();
    const email = null;

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Upsert the auth account
    await db.authAccount.upsert({
      where: {
        providerId_providerUserId: {
          providerId: authProvider.id,
          providerUserId: String(providerUserId),
        },
      },
      create: {
        providerId: authProvider.id,
        providerUserId: String(providerUserId),
        email,
        name: null,
        avatarUrl: null,
        accessToken: result.sessionToken || null,
        refreshToken: null,
        tokenExpiresAt: null,
        lastLoginAt: new Date(),
        metadata: JSON.stringify({ sessionToken }),
      },
      update: {
        email,
        accessToken: result.sessionToken || null,
        lastLoginAt: new Date(),
        metadata: JSON.stringify({ sessionToken }),
      },
    });

    // Build response with session cookie
    const response = NextResponse.json({
      success: true,
      userId: String(providerUserId),
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur lors de la vérification OTP:', error);
    return NextResponse.json(
      { success: false, userId: null, error: 'Impossible de vérifier le code OTP.' },
      { status: 500 },
    );
  }
}
