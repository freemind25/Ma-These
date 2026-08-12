import { NextRequest, NextResponse } from 'next/server';
import {
  listProviders,
  saveConfig,
  seedDefaultPolicies,
} from '@/lib/auth-providers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await seedDefaultPolicies();
    const providers = await listProviders();
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Erreur lors de la liste des fournisseurs:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer la liste des fournisseurs.' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, clientId, clientSecret, domain, enabled, extraConfig } = body;

    if (!provider || !['auth0', 'stytch', 'warrant'].includes(provider)) {
      return NextResponse.json(
        { error: 'Fournisseur invalide. Valeurs autorisées : auth0, stytch, warrant.' },
        { status: 400 },
      );
    }

    await saveConfig(provider, {
      clientId,
      clientSecret,
      domain,
      enabled: enabled ?? true,
      extraConfig: extraConfig ? JSON.stringify(extraConfig) : undefined,
    });

    return NextResponse.json({ success: true, message: 'Configuration sauvegardée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error);
    return NextResponse.json(
      { error: 'Impossible de sauvegarder la configuration du fournisseur.' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Le paramètre provider est requis.' },
        { status: 400 },
      );
    }

    const authProvider = await db.authProvider.findUnique({
      where: { provider },
    });

    if (!authProvider) {
      return NextResponse.json(
        { error: 'Fournisseur non trouvé.' },
        { status: 404 },
      );
    }

    await db.authProvider.delete({
      where: { provider },
    });

    return NextResponse.json({ success: true, message: 'Fournisseur supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du fournisseur:', error);
    return NextResponse.json(
      { error: 'Impossible de supprimer le fournisseur.' },
      { status: 500 },
    );
  }
}
