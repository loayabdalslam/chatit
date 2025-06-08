import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // The code below enables dev tools like taking screenshots of your site
    // while it is being developed on chef.convex.dev.
    // Feel free to remove this code if you're no longer developing your app with Chef.
    mode === "development"
      ? {
          name: "inject-chef-dev",
          transform(code: string, id: string) {
            if (id.includes("main.tsx")) {
              return {
                code: `${code}

/* Added by Vite plugin inject-chef-dev */
window.addEventListener('message', async (message) => {
  if (message.source !== window.parent) return;
  if (message.data.type !== 'chefPreviewRequest') return;

  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');
  await worker.respondToMessage(message);
});
            `,
                map: null,
              };
            }
            return null;
          },
        }
      : null,
    // End of code for taking screenshots on chef.convex.dev.
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    historyApiFallback: {
      // Handle client-side routing
      rewrites: [
        { from: /^\/contact$/, to: '/index.html' },
        { from: /^\/admin$/, to: '/index.html' },
        { from: /^\/super-admin$/, to: '/index.html' },
        { from: /^\/payment$/, to: '/index.html' },
        { from: /^\/(?!api|public|assets).*/, to: '/index.html' }
      ]
    },
    host: true, // Allow external connections
    cors: {
      origin: '*', // Allow all origins for development
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Accept'],
      credentials: false // Better for widget embedding
    },
    headers: {
      // Add CORS headers for the widget script
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, Accept',
      'Access-Control-Max-Age': '86400',
      // Security headers for iframe embedding
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors *;"
    },

  },
  preview: {
    historyApiFallback: {
      // Handle client-side routing
      rewrites: [
        { from: /^\/contact$/, to: '/index.html' },
        { from: /^\/admin$/, to: '/index.html' },
        { from: /^\/super-admin$/, to: '/index.html' },
        { from: /^\/payment$/, to: '/index.html' },
        { from: /^\/(?!api|public|assets).*/, to: '/index.html' }
      ]
    },
    host: true,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Accept'],
      credentials: false
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, Accept',
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors *;"
    }
  },
  // Ensure widget.js is properly served
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        widget: path.resolve(__dirname, 'public/widget.js')
      }
    }
  }
}));
