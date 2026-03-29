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
  // Plugin order is critical for Tailwind v4
  plugins: [tailwindcss(), react(), sathiWasmPlugin()],
  
  // FIX: Explicitly set CSS strategy
  css: {
    transformer: 'postcss', // or 'lightningcss' if you've installed it
  },

  build: {
    assetsDir: 'assets',
    cssCodeSplit: false, // Force all Tailwind into one file to prevent loading issues
    rollupOptions: {
      output: {
        // FIXED: Added explicit dots to extension handling
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.includes('racommons') || assetInfo.name?.endsWith('.wasm')) {
            return 'assets/[name].[ext]'; // Notice the DOT before [ext]
          }
          return 'assets/[name]-[hash].[ext]';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  optimizeDeps: {
    exclude: ['@runanywhere/web-llamacpp', '@runanywhere/web-onnx'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});