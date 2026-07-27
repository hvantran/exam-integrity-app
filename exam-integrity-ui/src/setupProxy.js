const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    '/exam-integrity-backend',
    createProxyMiddleware({
      target: 'http://localhost:8090',
      changeOrigin: true,
      ws: true,
      secure: false,
    }),
  );
};
