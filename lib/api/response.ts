import { NextResponse } from "next/server";

export type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: string; code?: string };

export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
) {
  const body: ApiResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

export function errorResponse(
  error: string,
  status = 400,
  code?: string
) {
  const body: ApiResponse<never> = { success: false, error };
  if (code) body.code = code;
  return NextResponse.json(body, { status });
}
