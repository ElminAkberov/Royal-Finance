import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'https://dev.royal-pay.org', // Gerçek API sunucunuz
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''), // /api ön ekini kaldır
            },
        },
    },
});
