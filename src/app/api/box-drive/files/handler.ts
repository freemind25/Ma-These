import { NextRequest, NextResponse } from 'next/server'
import { listDriveItems, uploadToDrive, createFolder, deleteItem } from '@/lib/box-drive'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const conn = await db.cloudDriveConnection.findFirst({ where: { provider: 'box' } })
    if (!conn?.connected) {
      return NextResponse.json({ files: [], connected: false })
    }

    const items = await listDriveItems(50)
    return NextResponse.json({ files: items, connected: true })
  } catch {
    return NextResponse.json({ files: [], error: 'Impossible de lister les fichiers' })
  }
}

/**
 * POST — Upload a file to Box
 * Expects multipart/form-data with a 'file' field.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadToDrive(file.name, buffer, file.type || 'application/octet-stream')

    // Update lastSyncAt
    const conn = await db.cloudDriveConnection.findFirst({ where: { provider: 'box' } })
    if (conn) {
      await db.cloudDriveConnection.update({ where: { id: conn.id }, data: { lastSyncAt: new Date() } })
    }

    return NextResponse.json({ success: true, file: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Échec de l\'upload'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * PUT — Create a subfolder in the ThesisFrame folder
 * Body: { folderName: string }
 */
export async function PUT(req: NextRequest) {
  try {
    const { folderName } = await req.json()
    if (!folderName?.trim()) {
      return NextResponse.json({ error: 'Nom de dossier requis' }, { status: 400 })
    }

    const result = await createFolder(folderName.trim())
    return NextResponse.json({ success: true, folder: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Échec de la création'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * DELETE — Delete a file or folder
 * Body: { fileId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { fileId } = await req.json()
    if (!fileId) {
      return NextResponse.json({ error: 'fileId requis' }, { status: 400 })
    }

    await deleteItem(fileId)
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Échec de la suppression'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
