/**
 * API route pour les outils MCP géographiques (intégrés, pas de service externe)
 *
 * GET  /api/geo-mcp?action=health   → Santé + outils disponibles
 * GET  /api/geo-mcp?action=list_tools → Découverte des outils MCP
 * POST /api/geo-mcp                       → Appel d'un outil MCP
 */

import { NextRequest, NextResponse } from 'next/server';
import { GEO_MCP_TOOLS, callGeoMcpTool } from '@/lib/geo-mcp-tools';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'health' || action === 'list_tools') {
    return NextResponse.json({
      status: 'ok',
      tools_count: GEO_MCP_TOOLS.length,
      tools: GEO_MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
    });
  }

  return NextResponse.json({ error: 'Action non reconnue. Utilisez ?action=health ou ?action=list_tools' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, args } = body;
    if (!tool) return NextResponse.json({ error: '"tool" requis' }, { status: 400 });
    const result = await callGeoMcpTool(tool, args || {});
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}
