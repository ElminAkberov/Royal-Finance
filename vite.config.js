import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'https://dev.royal-pay.org', // API URL
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''), // isteği '/api' ile başlayacak şekilde yönlendirin
            },
        },
    },
});
