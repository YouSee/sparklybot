import path from 'path'
import { getTestOptions } from './utils/testOptions'
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  findElementWithPropertyValue,
  stopServerAndBrowser,
  sendKeyEvent,
} from '../../dist/index'

beforeEach(async done => {
  await initializeSparkTestBrowser(getTestOptions())
  done()
})

afterEach(() => {
  stopServerAndBrowser()
})

const sendKeyCodeAndAssertElement = async keycode => {
  await sendKeyEvent('onKeyDown', keycode)
  const element = await findElementWithPropertyValue(
    'id',
    'keyboard-text-element',
  )
  expect(element).toBeTruthy()
  expect(element.text).toBe(`key: ${keycode}`)
}

test('Should be able send key events', async done => {
  await refreshSparkBrowser(
    path.resolve(__dirname, './sparkApplications/navigation.js'),
  )
  const element = await findElementWithPropertyValue('text', 'No keys yet!')
  expect(element).toBeTruthy()
  expect(element.id).toBe('keyboard-text-element')
  // Test keycodes
  await sendKeyCodeAndAssertElement('37')
  await sendKeyCodeAndAssertElement('38')
  await sendKeyCodeAndAssertElement('39')
  await sendKeyCodeAndAssertElement('40')
  await sendKeyCodeAndAssertElement('41')
  done()
})
