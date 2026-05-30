import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Intercept the .well-known/assetlinks.json directory explicitly first
  app.get('/.well-known/assetlinks.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    const envPackage = process.env.ANDROID_PACKAGE_NAME || "com.itssemi.twa";
    const envFingerprints = process.env.ANDROID_SHA256_FINGERPRINTS;

    // 1. If environment variables are explicitly passed, always prioritize the dynamic build
    if (envFingerprints) {
      // Split by comma in case multiple fingerprints are specified (e.g. debug + Google Play)
      const fingerprintsArray = envFingerprints
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      return res.json([
        {
          "relation": [
            "delegate_permission/common.handle_all_urls"
          ],
          "target": {
            "namespace": "android_app",
            "package_name": envPackage,
            "sha256_cert_fingerprints": fingerprintsArray
          }
        }
      ]);
    }

    // 2. Hardcode the exact values needed for this specific TWA deployment.
    // This removes any possibility of `fs` failing to read the file in Cloud Run.
    return res.json([
      {
        "relation": [
          "delegate_permission/common.handle_all_urls"
        ],
        "target": {
          "namespace": "android_app",
          "package_name": "com.itssemi.twa",
          "sha256_cert_fingerprints": [
            "C8:CF:38:F1:06:2E:55:63:42:C1:2A:F3:00:19:86:B2:43:85:AF:3B:4F:20:C5:FD:FB:2F:92:BB:58:49:8C:E4"
          ]
        }
      }
    ]);
  });

  // Serve static files in development or production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // CRITICAL: Express.static ignores directories starting with a dot unless dotfiles: 'allow' is passed
    app.use(express.static(distPath, { dotfiles: 'allow' }));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
