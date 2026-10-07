import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { albumAccess, albumConfigured } from "@/lib/album-server";
import { ALBUM_MEDIA_TYPES, IMAGE_MAX_SIZE_BYTES, VIDEO_MAX_SIZE_BYTES } from "@/lib/album-media";
import { validAlbumMediaPath } from "@/lib/album-security";

export async function POST(request: Request) {
  if (!albumConfigured()) return Response.json({ error: "The online album is not connected yet." }, { status: 503 });
  try {
    const body = await request.json() as HandleUploadBody;
    // Completion callbacks are verified by the SDK; user token requests need a session.
    if (body.type === "blob.generate-client-token") {
      const denied = await albumAccess();
      if (denied) return denied;
    }
    const result = await handleUpload({
      request, body,
      onBeforeGenerateToken: async (pathname) => {
        if (await albumAccess()) throw new Error("Unauthorized");
        if (!validAlbumMediaPath(pathname)) throw new Error("Invalid media path");
        return {
          allowedContentTypes: [...ALBUM_MEDIA_TYPES],
          maximumSizeInBytes: /\.(mp4|webm|mov)$/i.test(pathname) ? VIDEO_MAX_SIZE_BYTES : IMAGE_MAX_SIZE_BYTES,
          addRandomSuffix: false, allowOverwrite: false, validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Upload failed. Check the file format and try again." }, { status: 400 });
  }
}
