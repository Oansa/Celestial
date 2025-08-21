import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@dfinity/agent', '@dfinity/principal', '@dfinity/auth-client', '@dfinity/candid']
  },
  build: {
    rollupOptions: {
      external: []
    }
  },
  ssr: {
    noExternal: ['@dfinity/agent', '@dfinity/principal', '@dfinity/candid']
  }
})
