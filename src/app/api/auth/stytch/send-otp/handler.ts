import { NextRequest, NextResponse } from 'next/server';
import { stytchSendOTP } from '@/lib/auth-providers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'L\'adresse e-mail est requise.' },
        { status: 400 },
      );
    }

    const result = await stytchSendOTP(email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId || null,
      });
    } else {
      return NextResponse.json({
        success: false,
        messageId: null,
        error: result.error || 'Échec de l\'envoi du code OTP.',
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code OTP:', error);
    return NextResponse.json(
      { success: false, messageId: null, error: 'Impossible d\'envoyer le code OTP.' },
      { status: 500 },
    );
  }
}
