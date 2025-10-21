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
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('recharts') || id.includes('date-fns')) {
              return 'charts';
            }
            return 'vendor';
          }
          
          // Admin pages in separate chunk
          if (id.includes('/pages/Admin')) {
            return 'admin';
          }
          
          // Payment pages in separate chunk
          if (id.includes('/pages/Payment')) {
            return 'payment';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
    minify: 'esbuild',
    cssCodeSplit: true,
    reportCompressedSize: false,
  },
}));
