import path from 'path'
import { initializeSparkTestBrowser, refreshSparkBrowser, takeScreenshot } from './server'

// This file should expose needed test methods

// TODO: Remove this test code
initializeSparkTestBrowser({
  testRegexPath: 'someRegex',
})

// Send test event
setTimeout(() => refreshSparkBrowser(path.resolve(__dirname, './test/sparkApplication/index.js')), 5000)
setTimeout(() => takeScreenshot(path.resolve('./myimage.png')), 6000)