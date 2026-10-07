"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import { IMAGE_MAX_SIZE_BYTES, isAlbumMediaType, MEDIA_EXTENSION_BY_TYPE, VIDEO_MAX_SIZE_BYTES } from "@/lib/album-media";
import styles from "./photos.module.css";

type AlbumMemory = { id: string; name: string; url: string; contentType: string };

export default function PhotosPage() {
  const [memories, setMemories] = useState<AlbumMemory[]>([]);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [locked, setLocked] = useState(true);
  const [busy, setBusy] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  async function readResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) { setLocked(true); setMemories([]); }
      throw new Error(data.error || "Something went wrong. Please try again.");
    }
    return data;
  }

  async function loadPhotos(nextCursor?: string) {
    const data = await readResponse(await fetch(`/api/photos${nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : ""}`, { cache: "no-store" }));
    setMemories((current) => nextCursor ? [...current, ...data.photos] : data.photos);
    setCursor(data.cursor);
    setLocked(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/photos", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!active) return;
        if (response.ok) {
          setMemories(data.photos); setCursor(data.cursor); setLocked(false);
        } else if (response.status !== 401) setMessage(data.error);
      })
      .catch(() => { if (active) setMessage("Could not load the album. Please try again."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      await readResponse(await fetch("/api/photos/session", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
      }));
      setPassword("");
      await loadPhotos();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not open the album."); }
    finally { setBusy(false); }
  }

  async function addMedia(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setBusy(true);
    let saved = 0;
    let failed = 0;
    for (const file of files) {
      const maxSize = file.type.startsWith("video/") ? VIDEO_MAX_SIZE_BYTES : IMAGE_MAX_SIZE_BYTES;
      if (!isAlbumMediaType(file.type) || file.size > maxSize) {
        failed++; continue;
      }
      setMessage(`Saving ${file.name}...`);
      try {
        const extension = MEDIA_EXTENSION_BY_TYPE[file.type];
        const base = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 120) || "memory";
        const blob = await upload(`birthday-photos/${crypto.randomUUID()}/${base}.${extension}`, file, {
          access: "private", handleUploadUrl: "/api/photos/upload", multipart: true,
        });
        setMemories((current) => [{ id: blob.pathname, name: file.name, contentType: file.type, url: `/api/photos/file?path=${encodeURIComponent(blob.pathname)}` }, ...current]);
        saved++;
      } catch { failed++; }
    }
    setMessage(`${saved} memor${saved === 1 ? "y" : "ies"} saved online.${failed ? ` ${failed} could not be saved. Check your connection, supported file type, and size limits (20 MB for photos, 100 MB for videos), then try again.` : ""}`);
    setBusy(false);
  }

  async function removeMemory(memory: AlbumMemory) {
    if (!window.confirm(`Delete ${memory.name} from the shared album? This removes it for everyone.`)) return;
    setBusy(true);
    try {
      await readResponse(await fetch(`/api/photos?path=${encodeURIComponent(memory.id)}`, { method: "DELETE" }));
      setMemories((current) => current.filter((item) => item.id !== memory.id));
      setMessage(`${memory.name} deleted.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete album memory."); }
    finally { setBusy(false); }
  }

  async function refresh(nextCursor?: string) {
    setBusy(true);
    try { await loadPhotos(nextCursor); setMessage(""); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not load photos."); }
    finally { setBusy(false); }
  }

  async function lockAlbum() {
    setBusy(true);
    try {
      await readResponse(await fetch("/api/photos/session", { method: "DELETE" }));
      setLocked(true); setMemories([]); setCursor(null); setMessage("");
    } catch { setMessage("Could not lock the album. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/">← Back to the birthday surprise</Link>
      <header className={styles.header}>
        <p className="small-title">More memories with you</p>
        <h1>Our little memory album</h1>
        <p>A place for your favorite smiles, little adventures, and happy moments.</p>
      </header>

      {locked ? (
        <form className={styles.upload} onSubmit={unlock}>
          <label htmlFor="album-password">Our shared album</label>
          <input id="album-password" type="password" autoComplete="current-password" placeholder="Album password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={busy} />
          <button type="submit" disabled={busy}>{busy ? "Please wait..." : "Open album"}</button>
        </form>
      ) : <>
      <div className={styles.actions}>
        <button onClick={() => refresh()} disabled={busy}>Refresh album</button>
        <button onClick={lockAlbum} disabled={busy}>Lock album</button>
      </div>
      <section className={styles.upload} aria-label="Add photos and videos">
        <label htmlFor="photos">Add your photos and videos ♥</label>
        <input id="photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" multiple disabled={busy} onChange={addMedia} />
        <p>Photos up to 20 MB; videos up to 100 MB (MP4, WebM, or MOV).</p>
      </section>
      </>}

      <p className={styles.status} role="status">{message}</p>
      {!locked && (memories.length === 0 ? (
        <p className={styles.empty}>Your album is waiting for its first memory.</p>
      ) : (
        <section className={styles.grid} aria-label="Your photos and videos">
          {memories.map((memory) => (
            <article className={styles.card} key={memory.id}>
              <div className={styles.preview}>
                {memory.contentType.startsWith("video/") ? (
                  <video src={memory.url} controls preload="metadata" aria-label={memory.name} />
                ) : (
                  <Image src={memory.url} alt={memory.name} fill unoptimized sizes="(max-width: 600px) 100vw, 33vw" />
                )}
              </div>
              <p className={styles.name}>{memory.name}</p>
              <div className={styles.actions}>
                <a href={`${memory.url}&download=1`} download={memory.name} aria-label={`Download ${memory.name}`}>Download ↓</a>
                <button type="button" disabled={busy} onClick={() => removeMemory(memory)} aria-label={`Remove ${memory.name}`}>Remove</button>
              </div>
            </article>
          ))}
        </section>
      ))}
      {!locked && cursor && <button disabled={busy} onClick={() => refresh(cursor)}>Load more memories</button>}
    </main>
  );
}
