import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  findElementWithPropertyValue,
  stopServerAndBrowser,
} from '../../dist/index'

beforeEach(async () => {
  await initializeSparkTestBrowser()
})

afterEach(async () => {
  await stopServerAndBrowser()
})

test('Wait for specific image to be displayed', async done => {
  await refreshSparkBrowser(
    'https://www.sparkui.org/examples/polaroid/pp_polaroid.js',
  )
  const element = await findElementWithPropertyValue(
    'text',
    "A '99' Ice Cream - Dingle, Ireland",
    20000, // Set custom maxTimeout
  )
  expect(element).toBeTruthy()
  done()
})
