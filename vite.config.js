import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  build: {
    chunkSizeWarningLimit: 3000, // Set limit to 1000 kB or more
  },
  plugins: [react()],
});

