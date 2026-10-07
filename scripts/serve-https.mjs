/**
 * Minimal zero-dependency HTTPS static server for the built client.
 *
 * Meant for production hosts that only hold the build output (no Vite):
 * copy this file next to the dist-https/ folder and run
 *
 *   node serve-https.mjs [buildDir]
 *
 * Certificates default to ./certs/cert.pem + ./certs/key.pem; override with
 * HTTPS_CERT_PATH / HTTPS_KEY_PATH. Port defaults to 5443; override with
 * HTTPS_PREVIEW_PORT. Unknown paths fall back to index.html (SPA routing).
 */
import { createServer } from "https";
import { readFileSync, existsSync, statSync } from "fs";
import { extname, join, resolve, sep } from "path";

const ROOT = resolve(process.argv[2] || "dist-https");
const PORT = Number(process.env.HTTPS_PREVIEW_PORT) || 5443;
const CERT = process.env.HTTPS_CERT_PATH || "certs/cert.pem";
const KEY = process.env.HTTPS_KEY_PATH || "certs/key.pem";

if (!existsSync(ROOT)) {
  console.error(`[voe] build directory not found: ${ROOT}`);
  process.exit(1);
}
if (!existsSync(CERT) || !existsSync(KEY)) {
  console.error(
    `[voe] certificate pair not found (${CERT} / ${KEY}) — ` +
      "copy cert.pem + key.pem into certs/ or set HTTPS_CERT_PATH / HTTPS_KEY_PATH.",
  );
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

createServer(
  { cert: readFileSync(CERT), key: readFileSync(KEY) },
  (req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = resolve(join(ROOT, urlPath));

    // never serve anything outside the build directory
    if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    // SPA fallback: directories and unknown routes get index.html
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(ROOT, "index.html");
    }

    try {
      const data = readFileSync(filePath);
      res.writeHead(200, {
        "Content-Type":
          MIME[extname(filePath).toLowerCase()] || "application/octet-stream",
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  },
).listen(PORT, () => {
  console.log(`[voe] HTTPS client listener on https://0.0.0.0:${PORT} serving ${ROOT}`);
});
