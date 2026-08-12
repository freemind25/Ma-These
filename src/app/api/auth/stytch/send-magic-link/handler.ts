import { NextRequest, NextResponse } from 'next/server';
import { stytchSendMagicLink } from '@/lib/auth-providers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "L'adresse e-mail est requise." },
        { status: 400 },
      );
    }

    const result = await stytchSendMagicLink(email);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Échec de l'envoi du lien magique.",
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du lien magique:", error);
    return NextResponse.json(
      { success: false, error: "Impossible d'envoyer le lien magique." },
      { status: 500 },
    );
  }
}
