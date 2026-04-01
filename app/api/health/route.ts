import { NextResponse } from "next/server";

/**
 * Proxy /api/health to check Railway backend status.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "";

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { status: "error", detail: "BACKEND_URL not configured" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      next: { revalidate: 0 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: "error", detail: "Cannot reach backend" },
      { status: 502 },
    );
  }
}
