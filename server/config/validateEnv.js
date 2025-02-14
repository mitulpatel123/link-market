const { cleanEnv, str, port } = require('envalid');

function validateEnv() {
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
    PORT: port(),
    MONGODB_URI: str(),
    JWT_SECRET: str(),
    ACCESS_CODE: str(),
    DIARY_PIN: str(),
    CLIENT_URL: str(),
  });
}

module.exports = validateEnv; 