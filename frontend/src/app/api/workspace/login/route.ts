import { NextRequest, NextResponse } from "next/server";
import { loginRailwayUser, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/server/railway-db";

export const dynamic = "force-dynamic";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await loginRailwayUser({
      email: String(body.email ?? ""),
      password: String(body.password ?? "")
    });

    if (!result) {
      return NextResponse.json({ ok: false, message: "Email atau password salah." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, state: result.state });
    response.cookies.set(SESSION_COOKIE, result.token, cookieOptions);
    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Gagal login." },
      { status: 500 }
    );
  }
}