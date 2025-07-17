import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
    // Fix MIME type issues
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
    },
  },
  preview: {
    port: 8081,
    strictPort: false,
    // Add proper headers for production preview
    headers: {
      'Cache-Control': 'public, max-age=31536000',
      'Content-Type': 'application/javascript; charset=utf-8',
    },
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
        // Ensure proper file extensions for ES modules
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
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
    // Ensure compatibility with Lovable.dev
    outDir: 'dist',
    emptyOutDir: true,
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
  // Remove experimental features that cause module loading issues
  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false, // Remove charset to reduce size
      },
    },
  },
  // Fix base path for deployment
  base: mode === 'production' ? './' : '/',
}));
