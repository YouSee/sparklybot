import path from 'path'
import fs from 'fs'
import express from 'express'
import WebSocket from 'ws'
import { TestOptions, MessagePayload, SparkBrowserActions } from './types'
import { decodeBase64Image } from './utils/image'

let websocketServer:WebSocket.Server = null
let expressApp = null
let port:number = null
let hostname:string = null

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
    fs.writeFile(imagePathName, imageBuffer.data, err => console.log(err));
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
}

// Send info to connected clients method
const sendInfoToClients = (messagePayload: MessagePayload) => {
  console.log(`Sending message with action: ${messagePayload.action}`)
  return websocketServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(messagePayload))
    }
  })
}

export const refreshSparkBrowser = (sparkApplicationPath: string) => {
  // Import spark application and serve it in public folder
  if (!sparkApplicationPath) return
  fs.copyFile(path.resolve(sparkApplicationPath), path.resolve(__dirname, `../public/${path.basename(sparkApplicationPath)}`), (err) => {
    if (err) {
      console.log('Could not copy spark application')
      console.log(err)
      return
    }
    sendInfoToClients({
      action: SparkBrowserActions.REFRESH_BROWSER,
      payload: `http://${hostname}:${port}/${path.basename(sparkApplicationPath)}`
    })
  })
}

export const takeScreenshot = (path:string) => sendInfoToClients({
  action: SparkBrowserActions.TAKE_SCREENSHOT,
  payload: path,
})

export const getSceneTreeStructure = () => sendInfoToClients({
  action: SparkBrowserActions.PRINT_SCENE_STRUCTURE,
})
