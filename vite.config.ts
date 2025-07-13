import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Allow external connections
  },
  preview: {
    port: 8080,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
          'pdf-libs': ['html2canvas', 'jspdf'],
          'store': ['zustand'],
          'database': ['@neondatabase/serverless'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Enable better tree shaking
  optimizeDeps: {
    include: ['lucide-react'],
  },
});

