import { configureToMatchImageSnapshot } from './dist'

jest.setTimeout(30000)

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffDir: './results',
})

expect.extend({
  toMatchImageSnapshot,
})
