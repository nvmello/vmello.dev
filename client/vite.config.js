import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  svg: {
    jsx: true // Required for SVG as components
  }
  optimizeDeps: {
    force: true,
  },
  server: {
    host: true, // Expose to all network interfaces
    port: 5173,
  },
});
