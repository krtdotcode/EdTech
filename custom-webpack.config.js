module.exports = (config) => {
  const Dotenv = require('dotenv-webpack');

  config.plugins.push(new Dotenv());

  return config;
};
