import path from 'path'
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  findElementsWithPropertyValue,
  stopServerAndBrowser,
} from '../../dist/index'

beforeEach(async done => {
  await initializeSparkTestBrowser()
  done()
})

afterEach(async done => {
  await stopServerAndBrowser()
  done()
})

test('Should be able to fetch elements with same property', async done => {
  await refreshSparkBrowser(
    path.resolve(__dirname, './sparkApplications/manyChildren.js'),
  )
  const result = await findElementsWithPropertyValue('text', 'Hello World!')
  expect(result).toBeTruthy()
  expect(result.length).toBe(2)
  const newResult = await findElementsWithPropertyValue('text', 'We are many!')
  expect(newResult).toBeTruthy()
  expect(newResult.length).toBe(30)
  done()
})
