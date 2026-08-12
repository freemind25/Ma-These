import { NextRequest, NextResponse } from 'next/server';
import { stytchVerifyMagicLink } from '@/lib/auth-providers';
import { db } from '@/lib/db';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'tf_auth_session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Le jeton est requis.' },
        { status: 400 },
      );
    }

    const result = await stytchVerifyMagicLink(token);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        userId: null,
        email: null,
        error: result.error || 'Échec de la vérification du lien magique.',
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
        email: null,
        error: 'Fournisseur Stytch non configuré.',
      });
    }

    const providerUserId = result.userId || crypto.randomUUID();
    const email = result.email || null;

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
      email,
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
    console.error('Erreur lors de la vérification du lien magique:', error);
    return NextResponse.json(
      { success: false, userId: null, email: null, error: 'Impossible de vérifier le lien magique.' },
      { status: 500 },
    );
  }
}
