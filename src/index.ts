import path from 'path'
import { initializeSparkTestBrowser, refreshSparkBrowser, takeScreenshot, closeBrowser } from './server'

// This file should expose needed test methods

// TODO: Remove this test code
initializeSparkTestBrowser({
  testRegexPath: 'someRegex',
})

// Send test event
setTimeout(async () => {
  console.log('Call refresh')
  await refreshSparkBrowser(path.resolve(__dirname, './test/sparkApplication/index.js'))
  console.log('After refresh')
  await takeScreenshot(path.resolve(__dirname, './myimage.png'))
  await closeBrowser()
  console.log('actions done')
}, 7000)