// Show element async
px.import('px:scene.1.js').then(scene => {
  // Create element after 5 seconds
  setTimeout(() => {
    scene.create({
      t: 'text',
      id: 'my-test-id',
      parent: scene.root,
      text: '5 Seconds has passed!',
      textColor: 'green',
      pixelSize: 40,
    })
  }, 5000)

  scene.on('onClose', () => console.log('Hello got OnClose'))
})
