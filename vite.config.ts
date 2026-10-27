import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      __dirname: '""',
    },
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/pdf-lib/')) {
              return 'vendor-pdflib';
            }
            if (id.includes('node_modules/pdfjs-dist/')) {
              return 'vendor-pdfjs';
            }
            if (id.includes('node_modules/xlsx/') || id.includes('node_modules/pptxgenjs/')) {
              return 'vendor-office';
            }
            if (id.includes('node_modules/jszip/') || id.includes('node_modules/fflate/')) {
              return 'vendor-archive';
            }
            if (id.includes('src/data/')) {
              return 'app-tool-data';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
