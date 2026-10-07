/**
 * Zero-dependency static server for the built client — one process, two
 * listeners, mirroring how voe-server runs:
 *
 *   HTTP   dist/        on HTTP_PORT            (default 3000)
 *   HTTPS  dist-https/  on HTTPS_PREVIEW_PORT   (default 5443)
 *
 * Meant for production hosts that only hold the build output (no Vite):
 * copy this file next to the build folders and run
 *
 *   node serve-client.mjs                 # both listeners
 *   node serve-client.mjs --https-only    # skip the HTTP listener
 *   node serve-client.mjs --http-only     # skip the HTTPS listener
 *
 * The HTTPS listener needs ./certs/cert.pem + ./certs/key.pem (override with
 * HTTPS_CERT_PATH / HTTPS_KEY_PATH); if the pair or dist-https/ is missing it
 * is skipped with a warning — the HTTP listener is never affected. Build
 * directories can be overridden with HTTP_DIR / HTTPS_DIR. Unknown paths fall
 * back to index.html (SPA routing).
 */
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { readFileSync, existsSync, statSync } from "fs";
import { extname, join, resolve, sep } from "path";

const args = process.argv.slice(2);
const httpsOnly = args.includes("--https-only");
const httpOnly = args.includes("--http-only");

const HTTP_ROOT = resolve(process.env.HTTP_DIR || "dist");
const HTTPS_ROOT = resolve(process.env.HTTPS_DIR || "dist-https");
const HTTP_PORT = Number(process.env.HTTP_PORT) || 3000;
const HTTPS_PORT = Number(process.env.HTTPS_PREVIEW_PORT) || 5443;
const CERT = process.env.HTTPS_CERT_PATH || "certs/cert.pem";
const KEY = process.env.HTTPS_KEY_PATH || "certs/key.pem";

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

const handlerFor = (root) => (req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = resolve(join(root, urlPath));

  // never serve anything outside the build directory
  if (filePath !== root && !filePath.startsWith(root + sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // SPA fallback: directories and unknown routes get index.html
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, "index.html");
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
};

let started = 0;

if (!httpsOnly) {
  if (existsSync(HTTP_ROOT)) {
    createHttpServer(handlerFor(HTTP_ROOT)).listen(HTTP_PORT, () => {
      console.log(
        `[voe] HTTP client listener on http://0.0.0.0:${HTTP_PORT} serving ${HTTP_ROOT}`,
      );
    });
    started++;
  } else {
    console.warn(`[voe] skipping HTTP listener — ${HTTP_ROOT} not found`);
  }
}

if (!httpOnly) {
  if (!existsSync(CERT) || !existsSync(KEY)) {
    console.warn(
      `[voe] skipping HTTPS listener — certificate pair not found (${CERT} / ${KEY})`,
    );
  } else if (!existsSync(HTTPS_ROOT)) {
    console.warn(`[voe] skipping HTTPS listener — ${HTTPS_ROOT} not found`);
  } else {
    createHttpsServer(
      { cert: readFileSync(CERT), key: readFileSync(KEY) },
      handlerFor(HTTPS_ROOT),
    ).listen(HTTPS_PORT, () => {
      console.log(
        `[voe] HTTPS client listener on https://0.0.0.0:${HTTPS_PORT} serving ${HTTPS_ROOT}`,
      );
    });
    started++;
  }
}

if (started === 0) {
  console.error("[voe] nothing to serve — no listener could start.");
  process.exit(1);
}
