import path from 'path'
import { initializeSparkTestBrowser, refreshSparkBrowser, takeScreenshot, closeBrowser, getSceneTreeStructure, getMemoryUsage } from './server'

// Send test event
const testSetup = async () => {
  await initializeSparkTestBrowser({
    testRegexPath: 'someRegex',
  })
  await refreshSparkBrowser(path.resolve(__dirname, './test/sparkApplication/index.js'))
  await takeScreenshot(path.resolve(__dirname, './myimage.png'))
  const result = await getSceneTreeStructure()
  console.log(result)
  const memory = await getMemoryUsage()
  console.log(memory)
  await closeBrowser()
  console.log('actions done')
}

testSetup()