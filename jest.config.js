module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  globalTeardown: './globalTeardown.js',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './results',
        filename: 'report.html',
      },
    ],
  ],
}
