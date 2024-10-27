import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://dev.royal-pay.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1/internal')
      }
    }
  }
});
