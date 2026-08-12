import { NextRequest, NextResponse } from 'next/server';
import { warrantCheckLocal } from '@/lib/auth-providers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { featureKey, licenseType } = body;

    if (!featureKey || !licenseType) {
      return NextResponse.json(
        { error: 'Les paramètres featureKey et licenseType sont requis.' },
        { status: 400 },
      );
    }

    const result = await warrantCheckLocal(featureKey, licenseType);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la vérification d\'accès Warrant:', error);
    return NextResponse.json(
      { error: 'Impossible de vérifier l\'accès à la fonctionnalité.' },
      { status: 500 },
    );
  }
}
