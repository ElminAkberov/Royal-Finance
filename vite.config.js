import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://dev.royal-pay.org',
        changeOrigin: true,
        secure: false,
        // Bu satırı kaldırarak yolu doğrudan kullanabilirsiniz
        // rewrite: (path) => path.replace(/^\/api/, '/api/v1/internal/refills/')
      }
    }
  }
});
