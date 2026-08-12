import { NextRequest, NextResponse } from 'next/server'
import { generateLatex, type ThesisData } from '@/data/latex-template'

export async function POST(request: NextRequest) {
  try {
    const data: ThesisData = await request.json()

    const texContent = generateLatex(data)

    return new NextResponse(texContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-tex; charset=utf-8',
        'Content-Disposition': 'attachment; filename="these.tex"',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur de génération' },
      { status: 500 }
    )
  }
}