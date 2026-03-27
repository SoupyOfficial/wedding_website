import { query } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { RegistryContribution } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contributions = await query<RegistryContribution>(
      "SELECT * FROM RegistryContribution WHERE registryItemId = ? ORDER BY createdAt DESC",
      [id]
    );
    return successResponse(contributions);
  } catch (error) {
    console.error("Failed to fetch contributions:", error);
    return errorResponse("Internal server error.", 500);
  }
}
