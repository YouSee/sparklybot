import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  takeScreenshot,
  closeBrowser,
  stopServerAndBrowser,
  findElementWithPropertyValue,
  findElementsWithPropertyValue,
  sendKeyEvent,
} from './server'
import {
  toMatchImageSnapshot
} from './jest'

module.exports = {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  takeScreenshot,
  closeBrowser,
  stopServerAndBrowser,
  findElementWithPropertyValue,
  findElementsWithPropertyValue,
  sendKeyEvent,
  toMatchImageSnapshot,
}
