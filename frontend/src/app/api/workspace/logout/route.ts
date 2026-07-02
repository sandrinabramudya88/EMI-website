import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteRailwaySession, SESSION_COOKIE } from "@/lib/server/railway-db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    await deleteRailwaySession(token);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Gagal logout." },
      { status: 500 }
    );
  }
}