/* eslint-disable */

// Show element async
px.import('px:scene.1.js').then(scene => {
  // Create element after 2 seconds
  setTimeout(() => {
    scene.create({
      t: 'text',
      id: 'my-async-element',
      parent: scene.root,
      text: '2 Seconds has passed!',
      textColor: 'green',
      pixelSize: 40,
    })
  }, 2000)

  scene.on('onClose', () => console.log('Hello got OnClose'))
})
