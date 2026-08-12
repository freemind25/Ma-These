import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SESSION_COOKIE_NAME = 'tf_auth_session';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false });
    }

    // Find account by session token in metadata
    const accounts = await db.authAccount.findMany({
      where: {
        provider: {
          provider: 'auth0',
        },
      },
    });

    const account = accounts.find((a) => {
      const metadata = a.metadata as Record<string, unknown> | null;
      return metadata?.sessionToken === sessionToken;
    });

    if (!account) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      id: account.id,
      providerUserId: account.providerUserId,
      email: account.email,
      name: account.name,
      avatarUrl: account.avatarUrl,
      lastLoginAt: account.lastLoginAt,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Impossible de récupérer les informations utilisateur.' },
      { status: 500 },
    );
  }
}
