import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  // Ensure SVGR runs before the React plugin so the named ReactComponent export is available
  plugins: [svgr({ svgrOptions: { icon: true } }), react()],
  server: {
    port: 5173,
    open: true
  }
})
