import { defineConfig, mergeConfig } from "vite";
import fs from "fs";
import path from "path";
import baseConfig from "./vite.config";

/**
 * Config for the parallel HTTPS instance (tablet "install app" support).
 * Run via the *:https scripts with `--mode https`, which loads
 * `.env.https.local` (VITE_API_URL must point at the HTTPS API endpoint).
 * The regular HTTP instance and its scripts are untouched.
 */
const certFile = path.resolve(process.cwd(), "certs/cert.pem");
const keyFile = path.resolve(process.cwd(), "certs/key.pem");

if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
  throw new Error(
    "[voe] The HTTPS instance needs certs/cert.pem and certs/key.pem " +
      "(issue them with mkcert — see docs/https-tablet.md).",
  );
}

const https = {
  cert: fs.readFileSync(certFile),
  key: fs.readFileSync(keyFile),
};

export default mergeConfig(
  baseConfig,
  defineConfig({
    // host: true so tablets on the LAN can reach the listener
    server: {
      host: true,
      port: Number(process.env.HTTPS_DEV_PORT) || 5175,
      https,
    },
    preview: {
      host: true,
      port: Number(process.env.HTTPS_PREVIEW_PORT) || 5443,
      https,
    },
    // separate outDir so the HTTP build (dist/) and HTTPS build coexist
    build: { outDir: "dist-https" },
  }),
);
