module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
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
