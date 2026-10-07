export const ALBUM_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export type AlbumMediaType = (typeof ALBUM_MEDIA_TYPES)[number];

export const MEDIA_EXTENSION_BY_TYPE: Record<(typeof ALBUM_MEDIA_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export const IMAGE_MAX_SIZE_BYTES = 20 * 1024 * 1024;
export const VIDEO_MAX_SIZE_BYTES = 100 * 1024 * 1024;

export function isAlbumMediaType(type: string): type is AlbumMediaType {
  return ALBUM_MEDIA_TYPES.includes(type as (typeof ALBUM_MEDIA_TYPES)[number]);
}
