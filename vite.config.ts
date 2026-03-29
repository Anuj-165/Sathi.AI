import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function sathiWasmPlugin(): Plugin {
  const llamacppWasm = path.resolve(__dirname, 'node_modules/@runanywhere/web-llamacpp/wasm');

  return {
    name: 'sathi-wasm-orchestrator',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (url.includes('racommons-llamacpp')) {
          const fileName = url.split('/').pop()?.split('?')[0] || '';
          const filePath = path.join(llamacppWasm, fileName);
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', fileName.endsWith('.wasm') ? 'application/wasm' : 'application/javascript');
            return res.end(fs.readFileSync(filePath));
          }
        }
        next();
      });
    },

    writeBundle(options) {
      const outDir = options.dir ?? path.resolve(__dirname, 'dist');
      const assetsDir = path.join(outDir, 'assets');
      if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

      const llamacppFiles = [
        'racommons-llamacpp.wasm', 'racommons-llamacpp.js',
        'racommons-llamacpp-webgpu.wasm', 'racommons-llamacpp-webgpu.js'
      ];
      llamacppFiles.forEach(file => {
        const srcPath = path.join(llamacppWasm, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, path.join(assetsDir, file));
          fs.copyFileSync(srcPath, path.join(outDir, file));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(), // 1. Tailwind must be FIRST
    react(), 
    sathiWasmPlugin()
  ],

  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp', 
    },
  },

  assetsInclude: ['**/*.wasm'],
  
  optimizeDeps: {
    exclude: ['@runanywhere/web-llamacpp', '@runanywhere/web-onnx'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    assetsDir: 'assets',
    // 2. CSS Code Splitting should be enabled to ensure Tailwind builds its own file
    cssCodeSplit: true, 
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep neural assets unhashed
          if (assetInfo.name?.includes('racommons') || assetInfo.name?.endsWith('.wasm')) {
            return 'assets/[name][ext]';
          }
          // Let Tailwind/CSS have its normal hashed name
          return 'assets/[name]-[hash][ext]';
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.includes('racommons')) return 'assets/[name].js';
          return 'assets/[name]-[hash].js';
        },
        // 3. Keep entry names standard so Vite connects CSS properly
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});