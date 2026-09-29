import { test } from "node:test";
import assert from "node:assert/strict";
import { createSession, validSession, validPhotoPath, SESSION_SECONDS } from "../lib/album-security.ts";

test("album sessions reject expired, tampered, and old-password cookies", () => {
  const secret = "test-password-not-for-production";
  const token = createSession(secret, 1000);
  assert.equal(validSession(token, secret, 2000), true);
  assert.equal(validSession(token, secret, 1000 + SESSION_SECONDS * 1000), false);
  assert.equal(validSession(token + "tampered", secret, 2000), false);
  assert.equal(validSession(token, "changed-password", 2000), false);
  assert.equal(validSession("", secret, 2000), false);
});

test("photo operations are limited to image paths inside the album", () => {
  const prefix = "birthday-photos/12345678-1234-1234-1234-123456789abc/";
  assert.equal(validPhotoPath(prefix + "smile.jpeg"), true);
  for (const path of ["other/secret.jpg", prefix + "../secret.jpg", prefix + "script.svg", "https://example.com/photo.jpg", null]) {
    assert.equal(validPhotoPath(path), false);
  }
});
