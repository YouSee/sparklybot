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

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Send test event
const testSetup = async () => {
  await initializeSparkTestBrowser({
    testRegexPath: 'someRegex',
  })
  await refreshSparkBrowser('https://www.sparkui.org/examples/coverflow/coverflow_launch.js')
  await findElementWithPropertyValue('text', 'Everything Is Copy - Nora Ephron: Scripted & Unscripted')
  //await takeScreenshot(path.resolve(__dirname, './myimage.png'))
  await sendKeyEvent('onKeyDown', '39')
  await findElementWithPropertyValue('text', 'The Secret Life of Pets')
  await sendKeyEvent('onKeyDown', '39')
  await findElementWithPropertyValue('text', 'Christine')
  await sendKeyEvent('onKeyDown', '39')
  await findElementWithPropertyValue('text', 'Deadpool')
  await sendKeyEvent('onKeyDown', '39')
  await findElementWithPropertyValue('text', 'Jackie')
  await sendKeyEvent('onKeyDown', '37')
  const element = await findElementWithPropertyValue('text', 'Deadpool')
  if(!element) throw Error('Could not find element')
  closeBrowser()
  console.log('actions done')
}

testSetup()