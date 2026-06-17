import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

function versionPlugin() {
  return {
    name: 'version-file',
    closeBundle() {
      const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
      let commit = 'unknown'
      try {
        commit = execSync('git rev-parse --short HEAD').toString().trim()
      } catch (_) {}
      const built = new Date().toISOString()
      const content = `version=${pkg.version}\ncommit=${commit}\nbuilt=${built}\n`
      writeFileSync(resolve('dist/version.txt'), content)
    },
  }
}

export default defineConfig({
  base: '/dice/',
  plugins: [
    svelte(),
    versionPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
      manifest: {
        name: 'Dice Simulator',
        short_name: 'Dice',
        description: 'A mobile dice roller simulator',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/dice/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
    }),
  ],
})
