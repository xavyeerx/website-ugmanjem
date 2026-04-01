import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy /api/chat requests to the FastAPI backend on Railway.
 *
 * The BACKEND_URL env var should be set in Vercel dashboard
 * (server-side only, NOT prefixed with NEXT_PUBLIC_).
 *
 * Example: BACKEND_URL=https://your-app.up.railway.app
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "";

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      {
        detail:
          "Backend belum dikonfigurasi. Set BACKEND_URL di environment variables.",
      },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Proxy /api/chat error:", error);
    return NextResponse.json(
      {
        detail:
          "Gagal menghubungi backend. Pastikan BACKEND_URL sudah benar dan backend berjalan.",
      },
      { status: 502 },
    );
  }
}
