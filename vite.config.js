import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "react-vendor"
          }
          if (id.includes("node_modules/react-router-dom")) {
            return "router"
          }
          if (id.includes("node_modules/axios")) {
            return "http"
          }
          if (id.includes("node_modules/recharts")) {
            return "charts"
          }
          if (id.includes("node_modules/maplibre-gl")) {
            return "maps"
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons"
          }
          return undefined
        }
      }
    },
    chunkFileNames: "assets/[name]-[hash].js",
    assetFileNames: "assets/[name]-[hash].[ext]"
  }
})
