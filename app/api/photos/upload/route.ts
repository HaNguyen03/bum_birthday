import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { albumAccess, albumConfigured } from "@/lib/album-server";
import { PHOTO_TYPES, validPhotoPath } from "@/lib/album-security";

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
        if (!validPhotoPath(pathname)) throw new Error("Invalid photo path");
        return {
          allowedContentTypes: PHOTO_TYPES, maximumSizeInBytes: 20 * 1024 * 1024,
          addRandomSuffix: false, allowOverwrite: false, validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Upload failed. Check the file format and try again." }, { status: 400 });
  }
}
