import path from 'path'
import { getTestOptions } from './utils/testOptions'
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  findElementWithPropertyValue,
  stopServerAndBrowser,
  takeScreenshot,
  sendKeyEvent,
} from '../../dist/index'

beforeEach(async done => {
  await initializeSparkTestBrowser(getTestOptions())
  done()
})

afterEach(async done => {
  await stopServerAndBrowser()
  done()
})

test('Should be able to assert on element', async done => {
  await refreshSparkBrowser(
    path.resolve(__dirname, './sparkApplications/box.js'),
  )
  const element = await findElementWithPropertyValue('id', 'my-rect')
  expect(element).toBeTruthy()

  // Screenshot match testing
  const firstScreenshot = await takeScreenshot()
  expect(firstScreenshot).toMatchImageSnapshot()

  // Key events will change fillColor of rect
  await sendKeyEvent('onKeyDown', 'blue')
  // Screenshot match testing
  const secondScreenshot = await takeScreenshot()
  expect(secondScreenshot).toMatchImageSnapshot()

  done()
})
