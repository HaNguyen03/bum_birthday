import { test } from "node:test";
import assert from "node:assert/strict";
import { createSession, validSession, validAlbumMediaPath, albumMediaTypeForPath, albumMediaMatchesType, SESSION_SECONDS } from "../lib/album-security.ts";

test("album sessions reject expired, tampered, and old-password cookies", () => {
  const secret = "test-password-not-for-production";
  const token = createSession(secret, 1000);
  assert.equal(validSession(token, secret, 2000), true);
  assert.equal(validSession(token, secret, 1000 + SESSION_SECONDS * 1000), false);
  assert.equal(validSession(token + "tampered", secret, 2000), false);
  assert.equal(validSession(token, "changed-password", 2000), false);
  assert.equal(validSession("", secret, 2000), false);
});

test("album media paths accept supported images and videos only", () => {
  const prefix = "birthday-photos/12345678-1234-1234-1234-123456789abc/";
  assert.equal(validAlbumMediaPath(prefix + "smile.jpeg"), true);
  assert.equal(validAlbumMediaPath(prefix + "clip.mp4"), true);
  assert.equal(validAlbumMediaPath(prefix + "clip.webm"), true);
  assert.equal(validAlbumMediaPath(prefix + "clip.mov"), true);
  assert.equal(albumMediaTypeForPath(prefix + "clip.mp4"), "video/mp4");
  assert.equal(albumMediaTypeForPath(prefix + "clip.mov"), "video/quicktime");
  assert.equal(albumMediaMatchesType(prefix + "clip.mov", "video/quicktime"), true);
  assert.equal(albumMediaMatchesType(prefix + "clip.mp4", "image/jpeg"), false);
  for (const path of ["other/secret.jpg", prefix + "../secret.jpg", prefix + "script.svg", prefix + "clip.avi", "https://example.com/photo.jpg", null]) {
    assert.equal(validAlbumMediaPath(path), false);
  }
});
