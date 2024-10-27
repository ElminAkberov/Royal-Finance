const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://dev.royal-pay.org/',
      changeOrigin: true,
    })
  );
};
