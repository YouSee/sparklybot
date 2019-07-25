px.import('px:scene.1.js').then(scene => {
  // Register scene
  scene.getService('.sparklybot').registerScene(scene)

  const navigationText = scene.create({
    t: 'text',
    id: 'my-test-id',
    parent: scene.root,
    text: 'No keys yet!',
    textColor: 'red',
    pixelSize: 40,
  })
  const eventFunction = (e) => {
    console.log(`key: ${e.keyCode}`)
    navigationText.text = `key: ${e.keyCode}`
  }

  global.process.on('myevent', (e) => {
    eventFunction(e)
  })
  scene.root.on('onKeyDown', function (e) {
    eventFunction(e)
  })

  scene.on('onClose', () => console.log('Hello got OnClose'))
})
