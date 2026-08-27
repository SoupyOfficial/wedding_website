import { query } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query<{
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      rsvpSubmittedAt: string | null;
    }>(
      `SELECT id, firstName, lastName, email, rsvpSubmittedAt
       FROM Guest
       WHERE rsvpStatus = 'attending' AND rsvpSubmittedAt IS NOT NULL
       ORDER BY rsvpSubmittedAt ASC`
    );
    return successResponse(rows, { count: rows.length });
  } catch (error) {
    console.error("Failed to fetch raffle entries:", error);
    return errorResponse("Internal server error.", 500);
  }
}
