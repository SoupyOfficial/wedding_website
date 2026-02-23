import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId, now } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { WeddingPartyMember } from "@/lib/db-types";

export async function GET() {
  try {
    const members = await query<WeddingPartyMember>(
      "SELECT * FROM WeddingPartyMember ORDER BY side ASC, sortOrder ASC"
    );
    return successResponse(members);
  } catch (error) {
    console.error("Failed to fetch wedding party:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, side, bio, photoUrl, sortOrder } = body;

    if (!name?.trim() || !role?.trim() || !side?.trim()) {
      return errorResponse("Name, role, and side are required.", 400);
    }

    const id = generateId();
    const timestamp = now();
    await execute(
      `INSERT INTO WeddingPartyMember (id, name, role, side, bio, photoUrl, relationToBrideOrGroom, spouseOrPartner, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name.trim(), role.trim(), side.trim(), bio || "", photoUrl || null, body.relationToBrideOrGroom || "", body.spouseOrPartner || "", sortOrder ?? 0, timestamp, timestamp]
    );

    const member = await queryOne<WeddingPartyMember>("SELECT * FROM WeddingPartyMember WHERE id = ?", [id]);
    return successResponse(member, undefined, 201);
  } catch (error) {
    console.error("Failed to create wedding party member:", error);
    return errorResponse("Internal server error.", 500);
  }
}
