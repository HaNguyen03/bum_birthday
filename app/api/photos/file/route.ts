import { get } from "@vercel/blob";
import { albumAccess, storageError } from "@/lib/album-server";
import { albumMediaMatchesType, validAlbumMediaPath } from "@/lib/album-security";

export async function GET(request: Request) {
  const denied = await albumAccess();
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const path = params.get("path");
  if (!validAlbumMediaPath(path)) return Response.json({ error: "Invalid photo or video." }, { status: 400 });
  try {
    const result = await get(path, { access: "private" });
    if (!result || result.statusCode !== 200) return new Response("Photo not found", { status: 404 });
    if (!albumMediaMatchesType(path, result.blob.contentType)) {
      return new Response("Unsupported album media", { status: 415 });
    }
    const disposition = params.has("download") ? "attachment" : "inline";
    return new Response(result.stream, { headers: {
      "Content-Type": result.blob.contentType,
      "Content-Disposition": `${disposition}; filename="${path.split("/").pop()}"`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } });
  } catch { return storageError(); }
}
