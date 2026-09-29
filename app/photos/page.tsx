"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import styles from "./photos.module.css";

type Photo = { id: string; name: string; url: string };

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [locked, setLocked] = useState(true);
  const [busy, setBusy] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  async function readResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) { setLocked(true); setPhotos([]); }
      throw new Error(data.error || "Something went wrong. Please try again.");
    }
    return data;
  }

  async function loadPhotos(nextCursor?: string) {
    const data = await readResponse(await fetch(`/api/photos${nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : ""}`, { cache: "no-store" }));
    setPhotos((current) => nextCursor ? [...current, ...data.photos] : data.photos);
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
          setPhotos(data.photos); setCursor(data.cursor); setLocked(false);
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

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setBusy(true);
    let saved = 0;
    let failed = 0;
    for (const file of files) {
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 20 * 1024 * 1024) {
        failed++; continue;
      }
      setMessage(`Saving ${file.name}...`);
      try {
        const extension = file.type.split("/")[1];
        const base = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 120) || "photo";
        const blob = await upload(`birthday-photos/${crypto.randomUUID()}/${base}.${extension}`, file, {
          access: "private", handleUploadUrl: "/api/photos/upload", multipart: true,
        });
        setPhotos((current) => [{ id: blob.pathname, name: file.name, url: `/api/photos/file?path=${encodeURIComponent(blob.pathname)}` }, ...current]);
        saved++;
      } catch { failed++; }
    }
    setMessage(`${saved} photo${saved === 1 ? "" : "s"} saved online.${failed ? ` ${failed} could not be saved. Check your connection, file type, and 20 MB limit, then try again.` : ""}`);
    setBusy(false);
  }

  async function removePhoto(photo: Photo) {
    if (!window.confirm(`Delete ${photo.name} from the shared album? This removes it for everyone.`)) return;
    setBusy(true);
    try {
      await readResponse(await fetch(`/api/photos?path=${encodeURIComponent(photo.id)}`, { method: "DELETE" }));
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      setMessage(`${photo.name} deleted.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete photo."); }
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
      setLocked(true); setPhotos([]); setCursor(null); setMessage("");
    } catch { setMessage("Could not lock the album. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/">← Back to the birthday surprise</Link>
      <header className={styles.header}>
        <p className="small-title">More memories with you</p>
        <h1>Our little photo album</h1>
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
        <button onClick={() => refresh()} disabled={busy}>Refresh photos</button>
        <button onClick={lockAlbum} disabled={busy}>Lock album</button>
      </div>
      <section className={styles.upload} aria-label="Upload photos">
        <label htmlFor="photos">Choose your pictures ♥</label>
        <input id="photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={busy} onChange={addPhotos} aria-describedby="photo-help" />
        <p id="photo-help">JPG, PNG, WebP, or GIF · Up to 20 MB per photo</p>
        <p>Photos are saved in our shared album. Open it on any device with the album password.</p>
      </section>
      </>}

      <p className={styles.status} role="status">{message}</p>
      {!locked && (photos.length === 0 ? (
        <p className={styles.empty}>Your album is waiting for its first memory.</p>
      ) : (
        <section className={styles.grid} aria-label="Your photos">
          {photos.map((photo) => (
            <article className={styles.card} key={photo.id}>
              <div className={styles.preview}>
                <Image src={photo.url} alt={photo.name} fill unoptimized sizes="(max-width: 600px) 100vw, 33vw" />
              </div>
              <p className={styles.name}>{photo.name}</p>
              <div className={styles.actions}>
                <a href={`${photo.url}&download=1`} download={photo.name} aria-label={`Download ${photo.name}`}>Download ↓</a>
                <button type="button" disabled={busy} onClick={() => removePhoto(photo)} aria-label={`Remove ${photo.name}`}>Remove</button>
              </div>
            </article>
          ))}
        </section>
      ))}
      {!locked && cursor && <button disabled={busy} onClick={() => refresh(cursor)}>Load more photos</button>}
    </main>
  );
}
