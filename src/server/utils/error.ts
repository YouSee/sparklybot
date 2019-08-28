import { takeScreenshot, stopServerAndBrowser } from '../'

export const imageThumbnail = (path: string, width: string = '300px') => (`
  <a target="_blank" href="${path}">
    <img src="${path}" style="border:2px solid #000;width:${width};">
  </a>
`)

const screenshotError = (path: string, error: Error) => {
  error.stack = `
    ${error.stack}
    ${imageThumbnail(path)}
  `
  return error
}

export const killProcessAndThrowError = async (error: Error) => {
  await stopServerAndBrowser()
  throw error
}

export const throwErrorWithScreenshot = async (error: Error) => {
  // Try to take screenshot if possible
  const screenshotPath = `${process.cwd()}/test.png`
  return new Promise(resolve => {
    takeScreenshot(screenshotPath)
      .then(async () => {
        await killProcessAndThrowError(screenshotError(screenshotPath, error))
        resolve()
      })
  })

  return 
}