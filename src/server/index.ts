import path from 'path'
import fs from 'fs'
import express from 'express'
import WebSocket from 'ws'
import uid from 'uid2'
import { TestOptions, MessagePayload, SparkBrowserActions } from './types'
import { decodeBase64Image } from './utils/image'

let websocketServer:WebSocket.Server = null
let expressApp = null
let port:number = null
let hostname:string = null
let websocketMessageQueue = new Map()
let defaultTimeoutSeconds = 10

export const initializeSparkTestBrowser = (testOptions: TestOptions) => {
  // Initialize express server and websocket server
  expressApp = express()
  hostname = testOptions.hostname || 'localhost'
  port = testOptions.port || 3000
  const wsPort = testOptions.wsPort || 3333

  if (!testOptions.testRegexPath) throw new Error('No test regex provided')

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
    const client = fs
      .readFileSync(path.join(__dirname, '../client/index.js'), 'utf8')
      .replace('$websocketurl$', `ws://${hostname}:${wsPort}`)
      .replace('$hostname$', `${hostname}`)
      .replace('$portnumber$', `${port}`)
    res.send(client)
  })

  expressApp.listen(port, () => console.log(`Express server listening on port ${port}`))

  // Setup ws server
  websocketServer = new WebSocket.Server({ port: wsPort })

  websocketServer.on('connection', (ws) => {
    ws.on('message', (message: string) => {
      if (message) {
        const data = JSON.parse(message)
        if (!data || !data.ticketId) throw Error('Missing ticketId from client')
        // Resolve message queue
        const callbackQueueEvent = websocketMessageQueue.get(data.ticketId)
        if (!callbackQueueEvent) throw Error('Unknown message received from client')
        callbackQueueEvent.resolve(data)
      }
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

export const getSceneTreeStructure = (ticketId:string) => sendInfoToClients({
  action: SparkBrowserActions.PRINT_SCENE_STRUCTURE,
})