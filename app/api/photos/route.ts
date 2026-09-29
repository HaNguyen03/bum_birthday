import { del, list } from "@vercel/blob";
import { albumAccess, storageError } from "@/lib/album-server";
import { PHOTO_PREFIX, validPhotoPath } from "@/lib/album-security";

export async function GET(request: Request) {
  const denied = await albumAccess();
  if (denied) return denied;
  try {
    const cursor = new URL(request.url).searchParams.get("cursor") ?? undefined;
    const result = await list({ prefix: PHOTO_PREFIX, limit: 100, cursor });
    return Response.json({
      photos: result.blobs.filter((blob) => validPhotoPath(blob.pathname)).map((blob) => ({
        id: blob.pathname, name: blob.pathname.split("/").pop(),
        url: `/api/photos/file?path=${encodeURIComponent(blob.pathname)}`,
      })),
      cursor: result.hasMore ? result.cursor : null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return storageError(); }
}

export async function DELETE(request: Request) {
  const denied = await albumAccess();
  if (denied) return denied;
  const path = new URL(request.url).searchParams.get("path");
  if (!validPhotoPath(path)) return Response.json({ error: "Invalid photo." }, { status: 400 });
  try {
    await del(path);
    return Response.json({ ok: true });
  } catch { return storageError(); }
}
