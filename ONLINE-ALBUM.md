# Activate the online album on Vercel

1. Open the birthday project in Vercel, then **Storage → Create Storage → Blob**. Choose **Private** access and connect the store to the project. Include Production, Preview, and Development as needed.
2. Confirm the project has `BLOB_READ_WRITE_TOKEN` from the store connection. The client upload token exchange needs this server-only variable. Do not use a `NEXT_PUBLIC_` prefix.
3. In **Settings → Environment Variables**, add `ALBUM_PASSWORD`: a unique, randomly generated password of at least 16 characters. Share it only with people who should access the album. It allows viewing, uploading, downloading, and deleting photos.
4. Deploy this code and redeploy after changing environment variables.
5. Open `/photos`, enter the password, and upload a picture. Refresh and open the album on another device to verify it remains available. Check downloading and deleting a test photo too.

For local development, put these two variables in `.env.local` (already ignored by Git), then restart the dev server. Do not commit or send the values in chat.

Images upload directly to the private Blob store, up to 20 MB each. The album lists saved objects from `birthday-photos/`, with pagination. Downloads and previews pass through an authenticated streaming route. Session cookies expire after seven days; changing the password invalidates existing sessions. Existing photos from the old temporary album must be uploaded again.

Use Vercel Firewall rate limiting on `/api/photos/session` for a public deployment. Storage and transfer follow your Vercel plan's usage limits. This code does not create a store or configure your Vercel account automatically.

Reference: https://vercel.com/docs/vercel-blob/client-upload
