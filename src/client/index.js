/*
  Spark Automation Wrapper client
  This client communicates with the automation framework
  NOTE: px.import is specific for the Spark Browser
  https://www.sparkui.org/
*/
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
/* eslint-disable line-comment-position */

// Global
let GlobalScene = null
const websocketUrl = '$websocketurl$' // This value to be replaced by express server
const host = '$hostname$' // This value to be replaced by express server
const port = '$portnumber$' // This value to be replaced by express server

const uploadImage = (image, http, payload) => {
  const data = JSON.stringify({
    pngImage: image,
    imagePathName: payload,
  })
  return new Promise(function (resolve, reject) {
    var req = http.request({
      host,
      path: '/upload',
      method: 'POST',
      port,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, function (res) {
      if (res.statusCode != 200) {
          console.log('upload failed')
        return;
      }
      console.log('upload success')
    })
    req.on('error', function(e) {
      reject("ERROR "+e.message)
    })
    req.write(data)
    req.end()
  })
}

const refreshApplication = (scene, payload) => {
  console.log('refresh action!')
  if (!GlobalScene) {
    GlobalScene = scene.create({
      t: 'scene',
      parent: scene.root,
      url: payload,
    })
    GlobalScene.focus = true
    return
  }
  GlobalScene.dispose()
  GlobalScene = scene.create({
    t: 'scene',
    parent: scene.root,
    url: payload,
  })
}

const closeBrowser = () => global.progress.exit(0)

const handleServerResponse = (scene, data, http) => {
  const { action, payload } = JSON.parse(data)
  console.log(`Spark received action: ${action}`)
  console.log(`Payload is: ${payload}`)
  switch (action) {
    case 1: {
      refreshApplication(scene, payload)
      return
    }
    case 2: {
      closeBrowser()
      return
    }
    case 3: {
      uploadImage(scene.screenshot('image/png;base64'), http, payload)
      return
    }
    default:
      console.log('Action miss!')
      return
  }
}

px.import({ scene: 'px:scene.1.js', ws: 'ws', http: 'http' }) // eslint-disable-line no-undef
  .then(imports => {
    const { ws: Websocket, scene, http } = imports

    let websocket = null

    // Websocket initializer
    const startWebSocket = () => {
      websocket = new Websocket(websocketUrl)

      // Handle websocket messages from server
      websocket.on('message', data => handleServerResponse(scene, data, http))

      websocket.on('error', () => console.log('Connection error'))
    }

    const checkSocketConnection = () =>
      (!websocket || websocket.readyState === 3) && startWebSocket()

    // Start websocket
    startWebSocket()

    // Check connection every 5 seconds
    setInterval(checkSocketConnection, 5000)
  })
  .catch(err => console.error(`Imports failed for hotreload client: ${err}`))