import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  findElementWithPropertyValue,
  stopServerAndBrowser,
  sendKeyEvent,
} from '../dist/index'

beforeEach(async () => {
  await initializeSparkTestBrowser()
})

afterEach(async () => {
  await stopServerAndBrowser()
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const sendKeyCodeWithDelay = async (keyCode, ms) => {
  await sendKeyEvent('onKeyDown', keyCode)
  await sleep(ms)
}

test('Can test remote websites', async done => {
  await refreshSparkBrowser(
    'https://www.sparkui.org/examples/coverflow/coverflow_launch.js',
  )
  const element = await findElementWithPropertyValue(
    'text',
    'Everything Is Copy - Nora Ephron: Scripted & Unscripted',
  )
  expect(element).toBeTruthy()
  // Navigate right
  await sendKeyCodeWithDelay('39', 1000)
  await sendKeyCodeWithDelay('39', 1000)
  await sendKeyCodeWithDelay('39', 1000)
  await sendKeyCodeWithDelay('39', 1000)
  await sendKeyCodeWithDelay('37', 1000)
  await sendKeyCodeWithDelay('37', 1000)
  await sendKeyCodeWithDelay('13', 1000)
  // Assert element
  const element1 = findElementWithPropertyValue('text', 'Christine')
  expect(element1).toBeTruthy()
  await sendKeyCodeWithDelay('39', 1000)
  await sendKeyCodeWithDelay('13', 1000)
  // Assert element
  const element2 = findElementWithPropertyValue('text', 'Deadpool')
  expect(element2).toBeTruthy()
  done()
})

test('Can test without delay', async done => {
  await refreshSparkBrowser(
    'https://www.sparkui.org/examples/coverflow/coverflow_launch.js',
  )
  const element = await findElementWithPropertyValue(
    'text',
    'Everything Is Copy - Nora Ephron: Scripted & Unscripted',
  )
  expect(element).toBeTruthy()
  // Navigate right
  await sendKeyEvent('onKeyDown', '39')
  await sendKeyEvent('onKeyDown', '39')
  await sendKeyEvent('onKeyDown', '39')
  await sendKeyEvent('onKeyDown', '39')
  await sendKeyEvent('onKeyDown', '37')
  await sendKeyEvent('onKeyDown', '37')
  await sendKeyEvent('onKeyDown', '13')
  // Assert element
  const element1 = findElementWithPropertyValue('text', 'Christine')
  expect(element1).toBeTruthy()
  await sendKeyEvent('onKeyDown', '39')
  await sendKeyEvent('onKeyDown', '13')
  // Assert element
  const element2 = findElementWithPropertyValue('text', 'Deadpool')
  expect(element2).toBeTruthy()
  done()
})
