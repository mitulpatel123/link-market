const helmet = require('helmet');

const securityMiddleware = [
  helmet(),
  helmet.hidePoweredBy(),
  helmet.noSniff(),
  helmet.xssFilter(),
  helmet.frameguard({ action: 'deny' }),
];

module.exports = securityMiddleware; 