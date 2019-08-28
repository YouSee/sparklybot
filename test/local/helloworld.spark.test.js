import path from 'path'
import { getTestOptions } from './utils/testOptions'
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  findElementWithPropertyValue,
  stopServerAndBrowser,
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
    path.resolve(__dirname, './sparkApplications/helloWorld.js'),
  )
  const element = await findElementWithPropertyValue('text', 'Hello World!')
  expect(element).toBeTruthy()
  expect(element.id).toBe('my-test-id')
  done()
})
