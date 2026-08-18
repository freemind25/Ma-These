/**
 * geo-mcp-client — Client pour les outils MCP géographiques (mode intégré)
 *
 * Les outils MCP s'exécutent directement dans le processus Next.js.
 * Ce client est conservé pour la compatibilité avec le code existant.
 */

import {
  GEO_MCP_TOOLS,
  callGeoMcpTool,
  geocodeForContext,
  validateCoordsForContext,
  distanceForContext,
  elevationForContext,
  bboxForContext,
  validateGeojsonForContext,
  areaForContext,
  type McpTool,
  type McpToolResult,
} from './geo-mcp-tools';

export type { McpTool, McpToolResult };

export async function isGeoMcpAvailable(): Promise<boolean> {
  return true; // Toujours disponible en mode intégré
}

export async function listMcpTools(): Promise<McpTool[]> {
  return GEO_MCP_TOOLS;
}

export async function callMcpTool<T = unknown>(
  toolName: string,
  args: Record<string, unknown>
): Promise<McpToolResult & { data?: T }> {
  return callGeoMcpTool(toolName, args) as Promise<McpToolResult & { data?: T }>;
}

export {
  geocodeForContext,
  validateCoordsForContext,
  distanceForContext,
  areaForContext,
  elevationForContext,
  validateGeojsonForContext,
  bboxForContext,
};
