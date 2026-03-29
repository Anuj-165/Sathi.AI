import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Sathi Neural Orchestrator Plugin
 * Manages WASM binaries for LlamaCpp and Sherpa-ONNX.
 */
function sathiWasmPlugin(): Plugin {
  const llamacppWasm = path.resolve(__dirname, 'node_modules/@runanywhere/web-llamacpp/wasm');
  const onnxWasm = path.resolve(__dirname, 'node_modules/@runanywhere/web-onnx/wasm');

  return {
    name: 'sathi-wasm-orchestrator',

    // DEV SERVER: Map requests to node_modules
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (url.includes('sherpa-onnx.wasm')) {
          const filePath = path.join(onnxWasm, 'sherpa', 'sherpa-onnx.wasm');
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/wasm');
            return res.end(fs.readFileSync(filePath));
          }
        }
        next();
      });
    },

    // PRODUCTION: Copy binaries to flat dist paths
    writeBundle(options) {
      const outDir = options.dir ?? path.resolve(__dirname, 'dist');
      const assetsDir = path.join(outDir, 'assets');
      
      if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

      // 1. Flatten Sherpa-ONNX Assets (Fixes your 404)
      const sherpaDir = path.join(onnxWasm, 'sherpa');
      if (fs.existsSync(sherpaDir)) {
        fs.readdirSync(sherpaDir).forEach(file => {
          const src = path.join(sherpaDir, file);
          if (fs.statSync(src).isFile()) {
            // Copy to /assets/filename.wasm (Direct match for your error)
            fs.copyFileSync(src, path.join(assetsDir, file));
            // Copy to /filename.wasm (Fallback)
            if (file.endsWith('.wasm')) {
              fs.copyFileSync(src, path.join(outDir, file));
            }
          }
        });
        console.log('  ✓ Sherpa-ONNX engines deployed to flat assets.');
      }

      // 2. Flatten LlamaCpp Assets
      const llamacppFiles = ['racommons-llamacpp.wasm', 'racommons-llamacpp.js', 'racommons-llamacpp-webgpu.wasm'];
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
  plugins: [react(), tailwindcss(), sathiWasmPlugin()],
  server: {
    headers: {
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
  optimizeDeps: {
    exclude: ['@runanywhere/web-llamacpp', '@runanywhere/web-onnx'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  worker: { format: 'es' },
});