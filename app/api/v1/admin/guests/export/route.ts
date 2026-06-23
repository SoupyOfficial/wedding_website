import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin-auth";
import { query } from "@/lib/db";

interface GuestRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  group: string | null;
  rsvpStatus: string;
  rsvpRespondedAt: string | null;
  plusOneAllowed: number;
  plusOneName: string | null;
  plusOneAttending: number;
  mealPreference: string | null;
  dietaryNeeds: string | null;
  childrenCount: number;
  childrenNames: string | null;
  tableNumber: number | null;
  notes: string | null;
  songRequest: string | null;
}

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function boolLabel(val: number | boolean | null): string {
  if (val === null || val === undefined) return "";
  return val ? "Yes" : "No";
}

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const url = new URL(req.url);
  const status = url.searchParams.get("status"); // attending | declined | pending | null = all

  let sql = "SELECT * FROM Guest";
  const params: string[] = [];
  if (status && ["attending", "declined", "pending"].includes(status)) {
    sql += " WHERE rsvpStatus = ?";
    params.push(status);
  }
  sql += " ORDER BY lastName ASC, firstName ASC";

  const guests = await query<GuestRow>(sql, params);

  const headers = [
    "First Name", "Last Name", "Email", "Phone", "Group",
    "RSVP Status", "Responded At", "Plus One Allowed", "Plus One Name", "Plus One Attending",
    "Meal Preference", "Dietary Needs", "Children Count", "Children Names",
    "Table Number", "Song Request", "Notes",
  ];

  const rows = guests.map((g) => [
    escapeCSV(g.firstName),
    escapeCSV(g.lastName),
    escapeCSV(g.email),
    escapeCSV(g.phone),
    escapeCSV(g.group),
    escapeCSV(g.rsvpStatus),
    escapeCSV(g.rsvpRespondedAt ? new Date(g.rsvpRespondedAt).toLocaleDateString() : ""),
    escapeCSV(boolLabel(g.plusOneAllowed)),
    escapeCSV(g.plusOneName),
    escapeCSV(boolLabel(g.plusOneAttending)),
    escapeCSV(g.mealPreference),
    escapeCSV(g.dietaryNeeds),
    escapeCSV(g.childrenCount || 0),
    escapeCSV(g.childrenNames),
    escapeCSV(g.tableNumber),
    escapeCSV(g.songRequest),
    escapeCSV(g.notes),
  ].join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = status ? `guests-${status}.csv` : "guests-all.csv";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
