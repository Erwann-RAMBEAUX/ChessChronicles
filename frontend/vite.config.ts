import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  // Ensure SVGR runs before the React plugin so the named ReactComponent export is available
  plugins: [svgr({ svgrOptions: { icon: true } }), react()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-chess': ['chess.js', 'react-chessboard'],
          'vendor-i18n': ['i18next', 'react-i18next']
        }
      }
    }
  },
  preview: {
    port: 5173
  }
})
