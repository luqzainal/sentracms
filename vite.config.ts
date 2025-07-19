import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ServerResponse, IncomingMessage } from 'http';

interface RequestWithBody extends IncomingMessage {
  body?: any;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use('/api/generate-upload-url', async (req, res, next) => {
          const apiReq = req as RequestWithBody;
          const apiRes = res as ServerResponse & { status: (code: number) => any, json: (data: any) => void };

          try {
            const module = await server.ssrLoadModule('./api/generate-upload-url.mjs');
            const handler = module.default;
            
            let body = '';
            apiReq.on('data', chunk => {
              body += chunk.toString();
            });

            apiReq.on('end', async () => {
              if (body) {
                apiReq.body = JSON.parse(body);
              }
              
              // Mock res.status() and res.json()
              apiRes.status = (statusCode: number) => {
                apiRes.statusCode = statusCode;
                return apiRes;
              };
              apiRes.json = (data: any) => {
                apiRes.setHeader('Content-Type', 'application/json');
                apiRes.end(JSON.stringify(data));
              };

              await handler(apiReq, apiRes);
            });

          } catch (error) {
            console.error(error);
            apiRes.statusCode = 500;
            apiRes.end('Internal Server Error');
          }
        });
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
    host: true,
    port: 3000
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

