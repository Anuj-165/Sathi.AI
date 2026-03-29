import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Tactical WASM Plugin: Handles both Local Dev and Production builds.
 * Ensures SATHI's neural assets are served correctly from node_modules.
 */
function sathiWasmPlugin(): Plugin {
  const llamacppWasm = path.resolve(__dirname, 'node_modules/@runanywhere/web-llamacpp/wasm');
  const onnxWasm = path.resolve(__dirname, 'node_modules/@runanywhere/web-onnx/wasm');

  return {
    name: 'sathi-wasm-orchestrator',

    // 1. DEVELOPMENT SERVER MIDDLEWARE
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // Handle any request for Sherpa-ONNX WASM (catches /assets/ or root)
        if (url.includes('sherpa-onnx.wasm')) {
          const filePath = path.join(onnxWasm, 'sherpa', 'sherpa-onnx.wasm');
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/wasm');
            return res.end(fs.readFileSync(filePath));
          }
        }

        // Handle LlamaCpp Assets
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

    // 2. PRODUCTION BUILD ASSET COPYING
    writeBundle(options) {
      const outDir = options.dir ?? path.resolve(__dirname, 'dist');
      const assetsDir = path.join(outDir, 'assets');
      
      if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

      // Handle Sherpa-ONNX Files (STT/TTS Engine)
      const sherpaDir = path.join(onnxWasm, 'sherpa');
      if (fs.existsSync(sherpaDir)) {
        fs.readdirSync(sherpaDir).forEach(file => {
          const src = path.join(sherpaDir, file);
          if (fs.statSync(src).isFile()) {
            // TARGET 1: /assets/sherpa-onnx.wasm (Fixes the 404 in your logs)
            fs.copyFileSync(src, path.join(assetsDir, file));
            
            // TARGET 2: /sherpa-onnx.wasm (Fallback for different SDK pathing)
            if (file.endsWith('.wasm')) {
              fs.copyFileSync(src, path.join(outDir, file));
            }
          }
        });
        console.log(`  ✓ Sherpa-ONNX Neural Engines deployed to /assets/ and root.`);
      }

      // Handle LlamaCpp Files (LLM Engine)
      const llamacppFiles = [
        'racommons-llamacpp.wasm', 'racommons-llamacpp.js',
        'racommons-llamacpp-webgpu.wasm', 'racommons-llamacpp-webgpu.js'
      ];
      llamacppFiles.forEach(file => {
        const srcPath = path.join(llamacppWasm, file);
        if (fs.existsSync(srcPath)) {
          // Deploy to both locations for maximum compatibility
          fs.copyFileSync(srcPath, path.join(assetsDir, file));
          fs.copyFileSync(srcPath, path.join(outDir, file));
          console.log(`  ✓ LLM Asset deployed: ${file}`);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
    sathiWasmPlugin()
  ],
  server: {
    headers: {
      // Required for SharedArrayBuffer to function
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp', 
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp', 
    },
  },
  assetsInclude: ['**/*.wasm'],
  worker: { 
    format: 'es' 
  },
  optimizeDeps: {
    // Keep these out of the bundle to ensure WASM discovery works
    exclude: ['@runanywhere/web-llamacpp', '@runanywhere/web-onnx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});