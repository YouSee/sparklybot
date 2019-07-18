import path from 'path'
import fs from 'fs'
import express from 'express'
import WebSocket from 'ws'
import { TestOptions, MessagePayload, SparkBrowserActions } from './types'
import { decodeBase64Image } from './utils/image'

let websocketServer:WebSocket.Server = null
let expressApp = null

export const initializeSparkTestBrowser = (testOptions: TestOptions) => {
  // Initialize express server and websocket server
  expressApp = express()
  const port = testOptions.port || 3000
  const wsPort = testOptions.wsPort || 3333
  const hostname = testOptions.hostname || 'localhost'

  if (!testOptions.testRegexPath) throw new Error('No test regex provided')

  if (!testOptions.sparkApplicationPath) throw new Error('Missing spark application path')

  // Json support
  expressApp.use(express.json())

  // Serve static
  expressApp.use(express.static(path.dirname(testOptions.sparkApplicationPath)))

  // Serve spark application
  expressApp.use('*', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript')
    const client = fs
      .readFileSync(path.join(__dirname, './client/index.js'), 'utf8')
      .replace(
        '$applicationurl$',
        `http://${hostname}:${port}/${path.basename(testOptions.sparkApplicationPath)}`,
      )
      .replace('$websocketurl$', `ws://${hostname}:${wsPort}`)
      .replace('$hostname$', `${hostname}`)
      .replace('$portnumber$', `${port}`)
    res.send(client)
  })

  // Screenshot handling => /upload
  expressApp.post('/upload', (req, res) => {
    const { pngImage, imagePathName } = req.body
    const imageBuffer = decodeBase64Image(pngImage)
    fs.writeFile(imagePathName, imageBuffer.data, err => console.log(err));
  })

  expressApp.listen(port, () => console.log(`Express server listening on port ${port}`))

  // Setup ws server
  websocketServer = new WebSocket.Server({ port: wsPort })
}

// Send info to connected clients method
const sendInfoToClients = (messagePayload: MessagePayload) =>
  websocketServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(messagePayload))
    }
  })

const refreshSparkBrowser = () => sendInfoToClients({
  action: SparkBrowserActions.REFRESH_BROWSER,
})

const takeScreenshot = () => sendInfoToClients({
  action: SparkBrowserActions.TAKE_SCREENSHOT,
})

const getSceneTreeStructure = () => sendInfoToClients({
  action: SparkBrowserActions.PRINT_SCENE_STRUCTURE,
})
