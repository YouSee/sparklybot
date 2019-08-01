/* eslint-disable */

px.import('px:scene.1.js').then(scene => {
  const navigationText = scene.create({
    t: 'text',
    id: 'my-test-id',
    parent: scene.root,
    text: 'No keys yet!',
    textColor: 'red',
    pixelSize: 40,
  })

  scene.root.on('onKeyDown', function(e) {
    console.log(`key: ${e.keyCode}`)
    navigationText.text = `key: ${e.keyCode}`
  })

  scene.on('onClose', () => console.log('Hello got OnClose'))
})
