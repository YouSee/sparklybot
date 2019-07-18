import path from 'path'
import { initializeSparkTestBrowser } from './server'

// This file should expose needed test methods

// TODO: Remove this test code
initializeSparkTestBrowser({
  sparkApplicationPath: path.resolve('./test/sparkApplication/index.js'),
  testRegexPath: 'someRegex',
})

// Send test event