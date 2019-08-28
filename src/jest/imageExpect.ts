import { configureToMatchImageSnapshot } from 'jest-image-snapshot'

export const toMatchImageSnapshot = (customConfig = {}) => {
  return configureToMatchImageSnapshot(customConfig)
}
