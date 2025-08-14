import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: true, // Enable source maps for easier debugging
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress certain warnings that can occur with React
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      }
    }
  },
  define: {
    // Ensure proper React mode detection
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
});
