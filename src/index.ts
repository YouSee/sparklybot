import path from 'path'
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  takeScreenshot,
  closeBrowser,
  findElementWithPropertyValue,
  findElementsWithPropertyValue,
  sendKeyEvent
} from './server'

// Send test event
const testSetup = async () => {
  await initializeSparkTestBrowser({
    testRegexPath: 'someRegex',
  })
  await refreshSparkBrowser(path.resolve(__dirname, './test/sparkApplication/navigation.js'))
  await takeScreenshot(path.resolve(__dirname, './myimage.png'))
  const element = await findElementsWithPropertyValue('text', 'We are many!')
  console.log(element)
  console.log(element.length)
  await sendKeyEvent('onKeyDown', '6')
  await sendKeyEvent('onKeyDown', '7')
  await sendKeyEvent('onKeyDown', '8')
  await sendKeyEvent('onKeyDown', '9')
  console.log('actions done')
}

testSetup()