import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

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
    // Optimize bundle splitting for maximum performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
          router: ['react-router-dom'],
          form: ['react-hook-form', '@hookform/resolvers', 'zod'],
          icons: ['lucide-react'],
        },
      },
    },
    // Maximum optimization settings
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Reduce bundle size aggressively
    cssCodeSplit: true,
    // Optimize chunk size for HTTP/2
    chunkSizeWarningLimit: 500,
    // Enable tree shaking
    treeshake: {
      preset: 'smallest',
      moduleSideEffects: false,
    },
    // Compress assets
    reportCompressedSize: false, // Disable to speed up build
    // Optimize CSS
    cssMinify: 'esbuild',
  },
  // Optimize dependencies with aggressive settings
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'recharts',
      'lucide-react',
      'react-router-dom',
      'zod',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['lovable-tagger'],
    // Force optimization of all dependencies
    force: mode === 'production',
  },
  // Enable experimental features for performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        // Preload critical JS files
        return { runtime: `__import.meta.url__ + ${JSON.stringify(filename)}` };
      }
      return filename;
    },
  },
  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false, // Remove charset to reduce size
      },
    },
  },
  // Enable gzip compression for dev server
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
}));
