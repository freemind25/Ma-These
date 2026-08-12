import { NextResponse } from 'next/server'
import { isZAIConfigured } from '@/lib/zai'

export async function GET() {
  const configured = isZAIConfigured()
  return NextResponse.json({
    zai: {
      configured,
      message: configured
        ? 'SDK Z-AI configuré et prêt.'
        : 'Variables d\'environnement manquantes. Sur Vercel, ajoutez ZAI_BASE_URL, ZAI_API_KEY, ZAI_CHAT_ID, ZAI_TOKEN, ZAI_USER_ID.',
    },
  })
}