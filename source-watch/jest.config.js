module.exports = {
  testEnvironment: 'node',
  rootDir: __dirname,
  testMatch: ['**/tests/unit/**/*.spec.js'],
  moduleFileExtensions: ['js', 'json'],
  moduleDirectories: ['node_modules'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
