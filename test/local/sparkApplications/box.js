/* eslint-disable */

// Create colored box
px.import('px:scene.1.js').then(scene => {
  let box = scene.create({
    t: 'rect',
    id: 'my-rect',
    parent: scene.root,
    fillColor: 'green',
    w: 300,
    h: 300,
  })

  scene.root.on('onKeyDown', function(e) {
    // Change color to red
    box.fillColor = e.keyCode
  })

  scene.on('onClose', () => console.log('Hello got OnClose'))
})
