import { NextResponse } from "next/server";

export function apiResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiUnauthorized() {
  return apiError("Unauthorized: Invalid or missing API key", 401);
}

export function apiForbidden() {
  return apiError("Forbidden: Insufficient privileges for this action", 403);
}
