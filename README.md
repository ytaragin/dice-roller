# Dice Simulator

A mobile-first dice roller that runs in the browser. Built as a Progressive Web App (PWA), so it can be installed to a phone's home screen and used fully offline after the first visit.

## Tech stack

- **[Svelte 5](https://svelte.dev/)** — UI framework
- **[Vite](https://vite.dev/)** — build tool and dev server
- **[vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)** — service worker and web manifest generation via Workbox

## Getting started

```sh
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the dist/ folder locally
```

Serve the `dist/` folder from any static web server (nginx, Caddy, GitHub Pages, etc.) to make it accessible on a phone.

## Offline / installable (PWA)

On the first visit the service worker (`sw.js`) caches all app assets. After that, the app loads and runs with no internet connection.

On Android (Chrome) and iOS (Safari) the browser will offer an "Add to Home Screen" prompt. Once installed it launches fullscreen, with no browser chrome, behaving like a native app.

Two things drive this:

| File | Purpose |
|---|---|
| `dist/manifest.webmanifest` | Tells the browser the app name, icons, colors, and display mode |
| `dist/sw.js` + `dist/workbox-*.js` | Service worker that pre-caches all assets at install time and serves them offline |

Both files are generated automatically at build time by `vite-plugin-pwa` — you do not edit them directly. The source configuration lives in `vite.config.js`.

## Project structure

```
dice/
├── public/                  # Static assets copied as-is into dist/
│   ├── pwa-192x192.png      # PWA home screen icon (small)
│   └── pwa-512x512.png      # PWA home screen icon (large / maskable)
│
├── src/
│   ├── main.js              # Entry point — mounts the Svelte app
│   └── App.svelte           # Root component (global styles live here)
│
├── index.html               # HTML shell — PWA meta tags, apple-touch-icon
├── vite.config.js           # Vite + Svelte + PWA plugin configuration
├── svelte.config.js         # Svelte compiler options
└── package.json
```

### Adding new screens / components

Create new `.svelte` files under `src/` and import them into `App.svelte`. Global styles (reset, body background, layout) are in the `<style>` block of `App.svelte`. Component-scoped styles go in the individual component's own `<style>` block.

### Updating the PWA manifest

Edit the `manifest` object inside `VitePWA({...})` in `vite.config.js`. Changes take effect on the next build.

### Replacing the icons

Drop new PNG files named `pwa-192x192.png` and `pwa-512x512.png` into `public/` and rebuild. The 512×512 icon is also used as the maskable icon (used on Android to fill differently shaped icon masks), so keep important content away from the edges.
