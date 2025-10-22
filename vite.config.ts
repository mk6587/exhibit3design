import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Consolidate all node_modules into ONE stable vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          // Admin pages separate (changes infrequently)
          if (id.includes('/pages/Admin')) {
            return 'admin';
          }
          
          // Everything else stays in main chunk
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    cssCodeSplit: true,
    reportCompressedSize: false,
  },
}));
