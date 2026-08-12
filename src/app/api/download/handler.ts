import { NextRequest, NextResponse } from 'next/server'
import { readFile, access, constants } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Auth check: require matching secret
    const adminSecret = process.env.ADMIN_SECRET
    if (adminSecret) {
      const { searchParams } = new URL(request.url)
      const secret = searchParams.get('secret')
      if (secret !== adminSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Resolve file path from env or fallback
    const filePath = process.env.DOWNLOAD_FILE_PATH
      || join(process.cwd(), 'download', 'ThesisFrame.zip')

    // Check file existence before reading
    try {
      await access(filePath, constants.R_OK)
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="ThesisFrame-Desktop.zip"',
        'Content-Length': String(fileBuffer.length),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
