import path from 'path'
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  takeScreenshot,
  closeBrowser,
  getSceneTreeStructure,
  getMemoryUsage,
  findElementWithPropertyValue,
} from './server'

// Send test event
const testSetup = async () => {
  await initializeSparkTestBrowser({
    testRegexPath: 'someRegex',
  })
  await refreshSparkBrowser(path.resolve(__dirname, './test/sparkApplication/manyChildren.js'))
  await takeScreenshot(path.resolve(__dirname, './myimage.png'))
  const element = await findElementWithPropertyValue(10, 'text', 'Hello World!')
  console.log(element)
  await closeBrowser()
  console.log('actions done')
}

testSetup()