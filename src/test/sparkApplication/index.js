px.import('px:scene.1.js').then(scene => {
  // Register scene
  scene.getService('.sparklybot').registerScene(scene)

  scene.create({
    t: 'text',
    id: 'my-test-id',
    parent: scene.root,
    text: 'Hello World!',
    textColor: 'green',
    pixelSize: 40,
  })

  scene.on('onClose', () => console.log('Hello got OnClose'))
})
