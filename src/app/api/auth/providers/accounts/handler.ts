import { NextRequest, NextResponse } from 'next/server';
import { listAccounts } from '@/lib/auth-providers';
import type { AuthProviderName } from '@/lib/auth-providers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider') as AuthProviderName | undefined;

    const accounts = await listAccounts(provider);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Erreur lors de la récupération des comptes:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer la liste des comptes.' },
      { status: 500 },
    );
  }
}
