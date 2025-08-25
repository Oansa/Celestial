import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      DFX_NETWORK: JSON.stringify('local'),
      CANISTER_ID_USERAUTH: JSON.stringify('rdmx6-jaaaa-aaaaa-aaadq-cai'),
      CANISTER_ID_CELESTIAL_FRONTEND: JSON.stringify('rdmx6-jaaaa-aaaaa-aaadq-cai')
    }
  },
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
