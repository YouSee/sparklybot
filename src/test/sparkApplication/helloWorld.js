/* eslint-disable */

// Hello World application
px.import('px:scene.1.js').then(scene => {
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
