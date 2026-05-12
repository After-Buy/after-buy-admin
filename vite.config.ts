import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/admin': {
        target: 'https://dev.after-buy.r-e.kr',
        changeOrigin: true,
      }
    }
  }
})
