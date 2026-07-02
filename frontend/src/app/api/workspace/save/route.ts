import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { saveStateForSession, SESSION_COOKIE } from "@/lib/server/railway-db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const body = await request.json();
    const saved = await saveStateForSession(token, body.state);

    if (!saved) {
      return NextResponse.json({ ok: false, message: "Session login tidak valid." }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Gagal menyimpan data ke Railway Postgres." },
      { status: 500 }
    );
  }
}