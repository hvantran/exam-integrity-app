const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    ['/api', '/oauth2', '/login', '/logout'],
    createProxyMiddleware({
      target: 'http://localhost:8081',
      changeOrigin: true,
      ws: true,
      secure: false,
    }),
  );
};
