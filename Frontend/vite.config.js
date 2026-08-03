import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 3001,
    proxy: {
      '/users': 'http://localhost:3000',
      '/products': 'http://localhost:3000',
      '/cart': 'http://localhost:3000',
      '/order': 'http://localhost:3000',
      '/wishlist': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/review': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  }
});
