import { NextRequest, NextResponse } from "next/server";
import { registerRailwayUser, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/server/railway-db";

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
    const result = await registerRailwayUser({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      businessName: body.businessName ? String(body.businessName) : undefined
    });

    const response = NextResponse.json({ ok: true, state: result.state });
    response.cookies.set(SESSION_COOKIE, result.token, cookieOptions);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat akun.";
    const status = message.includes("terdaftar") ? 409 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}