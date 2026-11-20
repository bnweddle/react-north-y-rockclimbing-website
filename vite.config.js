import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const staticRouteEntries = ['routes.html', 'routes/past.html', 'classes.html']

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'static-route-entries',
      apply: 'build',
      async writeBundle({ dir }) {
        const index = join(dir, 'index.html')
        for (const entry of staticRouteEntries) {
          const destination = join(dir, entry)
          await mkdir(dirname(destination), { recursive: true })
          await copyFile(index, destination)
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})