# Project: Dice Roller

Svelte 5 + Vite PWA static site deployed to AWS S3 + CloudFront.

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deploy

Deploy config is in `deploy.json` (gitignored):
- **S3 bucket:** `taragin-web`
- **Prefix:** `dice/`
- **CloudFront distribution ID:** `E30GL0VLQTI335`

### Full deploy sequence

```bash
# 1. Build
npm run build

# 2. Sync to S3
aws s3 sync dist/ s3://taragin-web/dice/ --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E30GL0VLQTI335 --paths "/dice/*"
```

Always run all three steps in order. Never skip the CloudFront invalidation.

## Version file

The build automatically generates `dist/version.txt` via a custom Vite plugin in `vite.config.js`. It contains:

```
version=<package.json version>
commit=<git short SHA>
built=<ISO 8601 timestamp>
```

This file is synced to S3 as part of the normal deploy and is accessible at `/dice/version.txt`. It is intentionally excluded from the PWA service worker precache (only `.js`, `.css`, `.html`, `.png`, `.svg`, etc. are precached) so it always reflects the live deployment.
