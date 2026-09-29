import { cookies } from "next/headers";
import { COOKIE_NAME, validSession } from "./album-security";

export function albumConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN && (process.env.ALBUM_PASSWORD?.length ?? 0) >= 16);
}

export async function albumAccess() {
  if (!albumConfigured()) return Response.json({ error: "The online album is not connected yet." }, { status: 503 });
  const session = (await cookies()).get(COOKIE_NAME)?.value ?? "";
  if (!validSession(session, process.env.ALBUM_PASSWORD!)) {
    return Response.json({ error: "Enter the album password to continue." }, { status: 401 });
  }
  return null;
}

export function storageError() {
  return Response.json({ error: "The photo service is unavailable. Please try again." }, { status: 502 });
}
