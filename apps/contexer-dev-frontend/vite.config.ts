import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const enableElectron = process.env.ELECTRON === 'true' || mode === 'electron'

  return {
    plugins: [
      react(),
      ...(enableElectron
        ? [
            electron([
              {
                // Main-Process entry file of the Electron App.
                entry: 'electron/main.ts',
              },
              {
                entry: 'electron/preload.ts',
                onstart(options) {
                  // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
                  // instead of restarting the entire Electron App.
                  options.reload()
                },
              },
            ]),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        external: ['electron'],
      },
    },
  }
})
