import path from 'path'
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

test('Should be able to assert on async elements', async done => {
  await refreshSparkBrowser(
    path.resolve(__dirname, './sparkApplications/asyncElement.js'),
  )
  const asyncElement = await findElementWithPropertyValue(
    'id',
    'my-async-element',
  )
  expect(asyncElement).toBeTruthy()
  expect(asyncElement.text).toBe('2 Seconds has passed!')
  done()
})
