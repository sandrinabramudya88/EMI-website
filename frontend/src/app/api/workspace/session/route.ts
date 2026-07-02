import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStateFromSession, isRailwayDatabaseConfigured, publicState, SESSION_COOKIE } from "@/lib/server/railway-db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isRailwayDatabaseConfigured()) {
    return NextResponse.json({ ok: false, message: "DATABASE_URL Railway Postgres belum dikonfigurasi." }, { status: 503 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const state = await getStateFromSession(token);

    return NextResponse.json({ ok: true, authenticated: Boolean(state), state: state ?? publicState() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Gagal membuka session database." },
      { status: 500 }
    );
  }
}