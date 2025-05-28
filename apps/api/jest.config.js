const base = require('@sales-catalog/config/jest.config.js');

module.exports = {
  ...base,
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)']
};
