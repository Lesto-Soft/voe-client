# HTTPS tablet instance

The client can run a second, HTTPS instance in parallel with the normal HTTP one.
Tablets need it for the "install app" / standalone experience (browsers only offer
that on a secure origin); PCs keep using the HTTP instance unchanged.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev:https` | Vite dev server over HTTPS (default port 5175, LAN-exposed) |
| `npm run build:https` | Production build with the HTTPS API URL, output in `dist-https/` |
| `npm run preview:https` | Serves `dist-https/` over HTTPS (default port 5443, LAN-exposed) |

All three use `vite.config.https.ts` and run in Vite mode `https`. Ports can be
overridden with `HTTPS_DEV_PORT` / `HTTPS_PREVIEW_PORT`.

## Setup (per machine)

1. **Certificate** — place `cert.pem` + `key.pem` in `certs/` (gitignored). Issue them
   with [mkcert](https://github.com/FiloSottile/mkcert), listing every address the
   client is reached on:

   ```
   mkcert -cert-file certs/cert.pem -key-file certs/key.pem <lan-ip> localhost 127.0.0.1
   ```

   The device that opens the app must trust the mkcert **root CA** (on Android:
   Settings → Security → Encryption & credentials → Install a certificate →
   *CA certificate*, then restart Chrome). The HTTPS scripts fail with a clear error
   when the cert pair is missing.

2. **Environment** — create `.env.https.local` (gitignored, loaded only in `https`
   mode) pointing at the **HTTPS** API endpoint, since an HTTPS page cannot call an
   `http://` API or open `ws://` (mixed content):

   ```
   VITE_API_URL=https://<api-host>:<https-port>
   VITE_APP_ENV=development   # or production on the production host
   ```

   The API's own HTTPS listener is part of the server repo (see its `docs/HTTPS.md`).

## Install as app (Android)

Open the HTTPS origin in Chrome → menu → *Add to Home screen* → *Install*. The app
then launches standalone, without the browser address bar. This uses the web manifest
(`public/manifest.webmanifest`) and the PNG icons in `public/images/`.
