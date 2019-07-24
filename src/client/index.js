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
let websocket = null
let scenes = []

Object.stringify = function(value, space) {
  var cache = [];

  var output = JSON.stringify(value, function (key, value) {

      // filters parent on scene object to prevent circular structure
      if(key && key.length>0 && key == "parent") {
          return;
      }

      if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
              // Circular reference found, discard key
              return;
          }
          // Store value in our collection
          cache.push(value);
      }


      return value;
  }, space)

  cache = null; // Enable garbage collection

  return output;
}

const websocketSendData = data => websocket !== null && websocket.send(JSON.stringify(Object.assign({}, {
  processId: global.process.pid,
}, data)))

const uploadImage = (image, http, payload, ticketId) => {
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
        reject('upload failed')
        return
      }
      resolve()
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
      h: 720,
      w: 1280,
      url: payload,
    })
    GlobalScene.focus = true
    return 
  }
  GlobalScene.dispose()
  GlobalScene = scene.create({
    t: 'scene',
    parent: scene.root,
    h: 720,
    w: 1280,
    url: payload,
  })
}

const closeBrowser = () => global.process.exit(1)

const sendActionFullfilled = ticketId => websocketSendData({ ticketId })

const handleServerResponse = (scene, data, http) => {
  const { action, payload, ticketId } = JSON.parse(data)
  console.log(`Spark received action: ${action}`)
  console.log(`Payload is: ${payload}`)
  if (!ticketId || !action) {
    console.log('Missing information, cant handle request')
    return
  }
  switch (action) {
    case 1: {
      refreshApplication(scene, payload)
      GlobalScene.ready.then(() => sendActionFullfilled(ticketId))
      return
    }
    case 2: {
      sendActionFullfilled(ticketId)
      closeBrowser()
      return
    }
    case 3: {
      uploadImage(scene.screenshot('image/png;base64'), http, payload, ticketId)
        .then(() => sendActionFullfilled(ticketId))
      return
    }
    case 4: {
      // Print scene object
      websocketSendData({
        ticketId,
        sceneData: scenes.length ? scenes.map(scene => Object.stringify(scene.root, null, 20)) : null,
      })
      return
    }
    case 5: {
      // TODO: implement keystroke
      return
    }
    case 6: {
      // Get memory usage
      const texture = scene !== null ? scene.textureMemoryUsage() : null
      const mem = global.process.memoryUsage()
      websocketSendData({
        ticketId,
        texture,
        mem,
      })
      return
    }
    default: {
      console.log('Action miss!')
      sendActionFullfilled(ticketId)
      return
    }
  }
}

px.import({ scene: 'px:scene.1.js', ws: 'ws', http: 'http' }) // eslint-disable-line no-undef
  .then(imports => {
    const { ws: Websocket, scene, http } = imports

    scene.addServiceProvider((serviceName) => {                   
      if (serviceName === ".sparklybot")
      {
        return {
          registerScene:  (scene) => scenes.push(scene)
        }
      }
      return "allow"      
    })

    // Websocket initializer
    const startWebSocket = () => {
      websocket = new Websocket(websocketUrl)

      websocket.on('open', () => {
        websocketSendData({
          connected: true,
        })
      })

      // Handle websocket messages from server
      websocket.on('message', data => {
        try {
          handleServerResponse(scene, data, http)
        } catch (error) {
          console.log(error)
          websocketSendData({
            uncaughtException: true,
            err: `SparkBrowserError: ${error.message}`,
          })
        }
      })

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