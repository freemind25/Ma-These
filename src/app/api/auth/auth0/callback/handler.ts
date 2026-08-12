import { NextRequest, NextResponse } from 'next/server';
import {
  auth0ExchangeCode,
  auth0GetUserInfo,
} from '@/lib/auth-providers';
import { db } from '@/lib/db';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'tf_auth_session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/?auth_error=code_manquant', req.url));
    }

    // Exchange code for tokens
    const tokenResult = await auth0ExchangeCode(code);

    if (!tokenResult.accessToken) {
      return NextResponse.redirect(
        new URL(`/?auth_error=${encodeURIComponent(tokenResult.error || 'Échange de code échoué')}`, req.url),
      );
    }

    const { accessToken, refreshToken, expiresAt } = tokenResult;

    // Get user info
    const userInfo = await auth0GetUserInfo(accessToken);

    if (!userInfo || !userInfo.sub) {
      return NextResponse.redirect(
        new URL('/?auth_error=informations_utilisateur_invalides', req.url),
      );
    }

    // Find the Auth0 provider
    const authProvider = await db.authProvider.findUnique({
      where: { provider: 'auth0' },
    });

    if (!authProvider) {
      return NextResponse.redirect(
        new URL('/?auth_error=fournisseur_auth0_non_configure', req.url),
      );
    }

    const tokenExpiresAt = expiresAt
      ? new Date(expiresAt)
      : null;

    // Upsert the auth account
    const account = await db.authAccount.upsert({
      where: {
        providerId_providerUserId: {
          providerId: authProvider.id,
          providerUserId: userInfo.sub,
        },
      },
      create: {
        providerId: authProvider.id,
        providerUserId: userInfo.sub,
        email: userInfo.email || null,
        name: userInfo.name || userInfo.nickname || null,
        avatarUrl: userInfo.picture || null,
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiresAt,
        lastLoginAt: new Date(),
      },
      update: {
        email: userInfo.email || null,
        name: userInfo.name || userInfo.nickname || null,
        avatarUrl: userInfo.picture || null,
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiresAt,
        lastLoginAt: new Date(),
      },
    });

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Store session token in account metadata
    let meta: Record<string, unknown> = {}
    try { meta = account.metadata ? JSON.parse(account.metadata) : {} } catch { /* ignore */ }
    meta.sessionToken = sessionToken
    await db.authAccount.update({
      where: { id: account.id },
      data: {
        metadata: JSON.stringify(meta),
      },
    });

    // Set session cookie and redirect
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur lors du callback Auth0:', error);
    return NextResponse.redirect(
      new URL('/?auth_error=erreur_authentification', req.url),
    );
  }
}
