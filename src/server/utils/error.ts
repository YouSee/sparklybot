import kill from 'tree-kill'
import { takeScreenshot, processId } from '../'

export const killProcessAndThrowError = (error: Error) => {
  if (processId) kill(processId)
  throw error
}

export const throwErrorWithScreenshot = (error: Error) => {
  // Try to take screenshot if possible
  const screenshotPath = `${__dirname}/${new Date()}.png`
  return new Promise(resolve => {
    takeScreenshot(screenshotPath)
      .then(() => {
        
      })
      .catch(() => killProcessAndThrowError(error) )
  })

  return 
}