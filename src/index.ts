import path from 'path'
import { initializeSparkTestBrowser, refreshSparkBrowser, takeScreenshot, closeBrowser } from './server'

// Send test event
const testSetup = async () => {
  await initializeSparkTestBrowser({
    testRegexPath: 'someRegex',
  })
  console.log('Call refresh')
  await refreshSparkBrowser(path.resolve(__dirname, './test/sparkApplication/index.js'))
  console.log('After refresh')
  await takeScreenshot(path.resolve(__dirname, './myimage.png'))
  await closeBrowser()
  console.log('actions done')
}

testSetup()