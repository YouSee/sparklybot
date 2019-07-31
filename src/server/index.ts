import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import express from 'express'
import WebSocket from 'ws'
import uid from 'uid2'
import kill from 'tree-kill'
import { TestOptions, MessagePayload, SparkBrowserActions } from './types'
import { decodeBase64Image } from './utils/image'
import { deepSearchMultiple } from './utils/search'

let websocketServer:WebSocket.Server = null
let defaultSparkApplicationPath:string = '/Applications/Spark.app/Contents/MacOS/spark.sh'
let expressApp = null
let port:number = null
let hostname:string = null
let websocketMessageQueue = new Map()
let defaultTimeoutSeconds = 10
let processId:number = null

export const initializeSparkTestBrowser = (testOptions: TestOptions) => {
  // Initialize express server and websocket server
  return new Promise((resolve, reject) => {
    expressApp = express()
    hostname = testOptions.hostname || 'localhost'
    port = testOptions.port || 3000
    const wsPort = testOptions.wsPort || 3333

    if (!testOptions.testRegexPath) reject('No test regex provided')

    // Json support
    expressApp.use(express.json())

    // Serve public folder as static
    expressApp.use(express.static(path.resolve(__dirname, '../public')))

    // Screenshot handling => /upload
    expressApp.post('/upload', (req, res) => {
      const { pngImage, imagePathName } = req.body
      const imageBuffer = decodeBase64Image(pngImage)
      console.log(`Image path name: ${imagePathName}`)
      fs.writeFile(imagePathName, imageBuffer.data, (err) => {
        if (err) res.status(400).send('Error saving image')
        res.status(200).send()
      });
    })

    // Serve spark application
    expressApp.use('*', (req, res) => {
      res.setHeader('Content-Type', 'application/javascript')
      const customHostname = hostname === 'localhost' ? req.hostname : hostname
      const client = fs
        .readFileSync(path.join(__dirname, '../client/index.js'), 'utf8')
        .replace('$websocketurl$', `ws://${customHostname}:${wsPort}`)
        .replace('$hostname$', `${customHostname}`)
        .replace('$portnumber$', `${port}`)
      res.send(client)
    })

    expressApp.listen(port, () => {
      console.log(`Express server listening on port ${port}`)
      // Initiate spark browser if not using remote testing
      if (!testOptions.isRemoteTesting) {
        exec(`${defaultSparkApplicationPath} http://localhost:${port}/automation.js`, err => { if (err) throw new Error('Failed to load spark browser')})
      }
    })

    // Setup ws server
    websocketServer = new WebSocket.Server({ port: wsPort })

    websocketServer.on('connection', (ws) => {
      ws.on('message', (message: string) => {
        if (message) {
          const data = JSON.parse(message)
          if (data && data.connected && data.processId) {
            // Set current process Id
            processId = data.processId
            console.log(`got processId: ${processId}`)
            return resolve(data.processId)
          }
          if (data && data.uncaughtException) {
            if (processId) kill(processId)
            throw new Error(data.err)
          }
          if (!data || !data.ticketId) throw new Error('Missing ticketId from client')
          // Resolve message queue
          const callbackQueueEvent = websocketMessageQueue.get(data.ticketId)
          if (!callbackQueueEvent) throw new Error('Unknown message received from client')
          callbackQueueEvent.resolve(data)
        }
      })
    })
  })
}

// Send info to connected clients method
const sendInfoToClients = (messagePayload: MessagePayload) => {
  if(!websocketServer.clients.size) throw new Error('No clients connected to server')

  const timeoutSeconds = messagePayload.timeoutSeconds || defaultTimeoutSeconds

  return new Promise((resolve, reject) => {
    const ticketId = uid(10)

    // Send Message
    websocketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          ticketId,
          ...messagePayload,
        }))
      }
    })

    setTimeout(() => reject(`Timeout has expired on action: ${messagePayload.action}`), timeoutSeconds * 1000)

    // Add to message queue
    websocketMessageQueue.set(ticketId, {resolve, reject})
  })
}

export const refreshSparkBrowser = (sparkApplicationPath: string) => {
  // Import spark application and serve it in public folder
  if (!sparkApplicationPath) return
  return new Promise((resolve, reject) => {
    fs.copyFile(path.resolve(sparkApplicationPath), path.resolve(__dirname, `../public/${path.basename(sparkApplicationPath)}`), (err) => {
      if (err) reject(err)
      sendInfoToClients({
        action: SparkBrowserActions.REFRESH_BROWSER,
        payload: `http://${hostname}:${port}/${path.basename(sparkApplicationPath)}`
      })
        .then(() => resolve())
        .catch(err => reject(err))
    })
  })
}

export const takeScreenshot = (path:string) => sendInfoToClients({
  action: SparkBrowserActions.TAKE_SCREENSHOT,
  payload: path,
})

export const closeBrowser = () => {
  if (processId) kill(processId)
}

export const getSceneTreeStructure = () => sendInfoToClients({
  action: SparkBrowserActions.PRINT_SCENE_STRUCTURE,
})

export const getMemoryUsage = () => sendInfoToClients({
  action: SparkBrowserActions.GET_MEMORY_USAGE,
})

const searchSceneTreeWithPropertyValue = (multiple: boolean, timeoutSeconds: number, property: string, value: string): any => {
  return new Promise(async (resolve) => {
    let shouldContinue = true
    const timeout = setTimeout(() => { shouldContinue = false }, timeoutSeconds * 1000)
    while (shouldContinue) {
      const sceneTreeStucture:any = await getSceneTreeStructure()
      // Find element with property and value
      const scenesJson = sceneTreeStucture.sceneData.map((scene:any) => JSON.parse(scene))
      const result = deepSearchMultiple(multiple, scenesJson, property, propertyValue => propertyValue === value)
      if (result) {
        clearTimeout(timeout)
        resolve(result)
        break
      }
    }
    resolve(multiple ? [] : null)
  })
}

export const findElementsWithPropertyValue = (property: string, value: string, timeoutSeconds: number = 10): Array<any> =>
  searchSceneTreeWithPropertyValue(true, timeoutSeconds, property, value)

export const findElementWithPropertyValue = (property: string, value: string, timeoutSeconds: number = 10): any =>
  searchSceneTreeWithPropertyValue(false, timeoutSeconds, property, value)

export const sendKeyEvent = (eventType: string, keyCode: string) => sendInfoToClients({
  action: SparkBrowserActions.KEYSTROKE,
  payload: {
    keyCode,
    eventType,
  }
})