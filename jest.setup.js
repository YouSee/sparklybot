import { toMatchImageSnapshot } from './dist'

jest.setTimeout(30000)

expect.extend({ toMatchImageSnapshot })
