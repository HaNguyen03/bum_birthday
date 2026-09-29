import { createHmac, timingSafeEqual, createHash } from "node:crypto";

export const COOKIE_NAME = "birthday-album";
export const SESSION_SECONDS = 7 * 24 * 60 * 60;
export const PHOTO_PREFIX = "birthday-photos/";
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function sameSecret(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export function createSession(secret: string, now = Date.now()) {
  const expiry = String(now + SESSION_SECONDS * 1000);
  return `${expiry}.${createHmac("sha256", secret).update(expiry).digest("hex")}`;
}

export function validSession(value: string, secret: string, now = Date.now()) {
  const [expiry, signature, extra] = value.split(".");
  if (extra || !/^\d+$/.test(expiry ?? "") || !signature || Number(expiry) <= now) return false;
  return sameSecret(signature, createHmac("sha256", secret).update(expiry).digest("hex"));
}

export function validPhotoPath(path: unknown): path is string {
  return typeof path === "string" && /^birthday-photos\/[a-f0-9-]{36}\/[a-zA-Z0-9_.-]{1,160}\.(jpg|jpeg|png|webp|gif)$/i.test(path);
}
