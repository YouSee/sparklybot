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
  toMatchImageSnapshot,
  configureToMatchImageSnapshot,
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
  configureToMatchImageSnapshot,
}
