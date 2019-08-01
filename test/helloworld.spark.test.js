import path from 'path'
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  findElementWithPropertyValue,
  stopServerAndBrowser,
} from '../dist/index'

beforeEach(async () => {
  await initializeSparkTestBrowser()
})

afterEach(async () => {
  await stopServerAndBrowser()
})

test('Should be able to assert on element', async done => {
  await refreshSparkBrowser(
    path.resolve(__dirname, './sparkApplications/helloworld.js'),
  )
  const element = await findElementWithPropertyValue('text', 'Hello World!')
  expect(element).toBeTruthy()
  expect(element.id).toBe('my-test-id')
  done()
})
