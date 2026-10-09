const { createProxyMiddleware } = require('http-proxy-middleware');

const gatewayTarget =
  process.env.REACT_APP_GATEWAY_PROXY_TARGET ||
  process.env.REACT_APP_GATEWAY_URL ||
  'http://localhost:6081';

module.exports = function setupProxy(app) {
  app.use(
    ['/api', '/oauth2', '/login', '/logout'],
    createProxyMiddleware({
      target: gatewayTarget,
      changeOrigin: true,
      ws: true,
      secure: false,
    }),
  );
};
