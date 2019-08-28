import fs from 'fs'
import path from 'path'
import uid from 'uid2'
import mkdirp from 'mkdirp'
import { takeScreenshot, stopServerAndBrowser, publicPath } from '../'

export const imageThumbnail = (filePath: string, width: string = '300px') => (`
  <a target="_blank" href="${path.basename(filePath)}">
    <img src="${path.basename(filePath)}" style="border:2px solid #000;width:${width};">
  </a>
`)

const screenshotError = (filePath: string, error: Error) => {
  error.stack = `
    ${error.stack}
    ${imageThumbnail(filePath)}
  `
  return error
}

export const killProcessAndThrowError = async (error: Error) => {
  await stopServerAndBrowser()
  throw error
}

export const throwErrorWithScreenshot = async (error: Error) => {
  // Try to take screenshot if possible
  const screenshotPath = `${publicPath}/${uid(10)}.png`
  if (!fs.existsSync(path.dirname(publicPath))) {
    mkdirp.sync(publicPath)
  }
  return new Promise(resolve => {
    takeScreenshot(screenshotPath)
      .then(async () => {
        await killProcessAndThrowError(screenshotError(screenshotPath, error))
        resolve()
      })
  })
}