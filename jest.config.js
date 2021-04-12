module.exports = {
  rootDir: __dirname,
  moduleFileExtensions: ['js'],
  moduleDirectories: ['node_modules', 'src'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.js?$': 'babel-jest',
  },
  timers: 'fake',
  collectCoverage: true,
  coverageDirectory: '<rootDir>/.coverage/jest',
};
