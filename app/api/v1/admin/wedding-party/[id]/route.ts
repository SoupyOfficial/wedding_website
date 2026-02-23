import { NextRequest } from "next/server";
import { queryOne, execute, now } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { WeddingPartyMember } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, role, side, bio, photoUrl, sortOrder, relationToBrideOrGroom, spouseOrPartner } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (name !== undefined) { sets.push("name = ?"); args.push(name.trim()); }
    if (role !== undefined) { sets.push("role = ?"); args.push(role.trim()); }
    if (side !== undefined) { sets.push("side = ?"); args.push(side.trim()); }
    if (bio !== undefined) { sets.push("bio = ?"); args.push(bio || ""); }
    if (photoUrl !== undefined) { sets.push("photoUrl = ?"); args.push(photoUrl || null); }
    if (relationToBrideOrGroom !== undefined) { sets.push("relationToBrideOrGroom = ?"); args.push(relationToBrideOrGroom || ""); }
    if (spouseOrPartner !== undefined) { sets.push("spouseOrPartner = ?"); args.push(spouseOrPartner || ""); }
    if (sortOrder !== undefined) { sets.push("sortOrder = ?"); args.push(sortOrder); }

    sets.push("updatedAt = ?");
    args.push(now());
    args.push(id);

    const { rowsAffected } = await execute(
      `UPDATE WeddingPartyMember SET ${sets.join(", ")} WHERE id = ?`,
      args
    );
    if (rowsAffected === 0) return errorResponse("Member not found.", 404);

    const member = await queryOne<WeddingPartyMember>("SELECT * FROM WeddingPartyMember WHERE id = ?", [id]);
    return successResponse(member);
  } catch (error) {
    console.error("Failed to update member:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM WeddingPartyMember WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("Member not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete member:", error);
    return errorResponse("Internal server error.", 500);
  }
}
