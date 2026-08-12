import { NextRequest, NextResponse } from 'next/server';
import { buildAuth0AuthorizeUrl } from '@/lib/auth-providers';

export async function GET() {
  try {
    const result = await buildAuth0AuthorizeUrl();

    if (result.url) {
      return NextResponse.json({ url: result.url });
    } else {
      return NextResponse.json(
        { url: null, error: result.error || 'Impossible de générer l\'URL d\'autorisation Auth0.' },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'autorisation:', error);
    return NextResponse.json(
      { url: null, error: 'Impossible de générer l\'URL d\'autorisation Auth0.' },
      { status: 500 },
    );
  }
}
