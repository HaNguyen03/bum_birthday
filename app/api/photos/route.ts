import { del, list } from "@vercel/blob";
import { albumAccess, storageError } from "@/lib/album-server";
import { albumMediaTypeForPath, PHOTO_PREFIX, validAlbumMediaPath } from "@/lib/album-security";

export async function GET(request: Request) {
  const denied = await albumAccess();
  if (denied) return denied;
  try {
    const cursor = new URL(request.url).searchParams.get("cursor") ?? undefined;
    const result = await list({ prefix: PHOTO_PREFIX, limit: 100, cursor });
    return Response.json({
      photos: result.blobs.flatMap((blob) => {
        const contentType = albumMediaTypeForPath(blob.pathname);
        return contentType ? [{
          id: blob.pathname, name: blob.pathname.split("/").pop() ?? "memory",
          url: `/api/photos/file?path=${encodeURIComponent(blob.pathname)}`,
          contentType,
        }] : [];
      }),
      cursor: result.hasMore ? result.cursor : null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return storageError(); }
}

export async function DELETE(request: Request) {
  const denied = await albumAccess();
  if (denied) return denied;
  const path = new URL(request.url).searchParams.get("path");
  if (!validAlbumMediaPath(path)) return Response.json({ error: "Invalid photo or video." }, { status: 400 });
  try {
    await del(path);
    return Response.json({ ok: true });
  } catch { return storageError(); }
}
