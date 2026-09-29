import { cookies } from "next/headers";
import { albumConfigured } from "@/lib/album-server";
import { COOKIE_NAME, SESSION_SECONDS, createSession, sameSecret } from "@/lib/album-security";

export async function POST(request: Request) {
  if (!albumConfigured()) return Response.json({ error: "The online album is not connected yet." }, { status: 503 });
  let password: unknown;
  try { ({ password } = await request.json()); } catch {
    return Response.json({ error: "Enter the album password." }, { status: 400 });
  }
  if (typeof password !== "string" || !sameSecret(password, process.env.ALBUM_PASSWORD!)) {
    return Response.json({ error: "That password is not correct." }, { status: 401 });
  }
  (await cookies()).set(COOKIE_NAME, createSession(process.env.ALBUM_PASSWORD!), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(COOKIE_NAME);
  return Response.json({ ok: true });
}
