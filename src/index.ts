import path from 'path'
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  takeScreenshot,
  closeBrowser,
  findElementWithPropertyValue,
  findElementsWithPropertyValue
} from './server'

// Send test event
const testSetup = async () => {
  await initializeSparkTestBrowser({
    testRegexPath: 'someRegex',
  })
  await refreshSparkBrowser(path.resolve(__dirname, './test/sparkApplication/manyChildren.js'))
  await takeScreenshot(path.resolve(__dirname, './myimage.png'))
  const element = await findElementsWithPropertyValue('text', 'We are many!')
  console.log(element)
  console.log(element.length)
  await closeBrowser()
  console.log('actions done')
}

testSetup()