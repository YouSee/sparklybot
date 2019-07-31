// Spark application with lots of children rendered
px.import('px:scene.1.js').then(scene => {
  scene.create({
    t: 'text',
    id: 'test',
    parent: scene.root,
    text: 'Hello World!',
    textColor: 'green',
    pixelSize: 40,
  })
  const newNode = scene.create({
    t: 'text',
    id: 'my-test-id-2',
    x: 200,
    y: 200,
    parent: scene.root,
    text: 'Hello World!',
    textColor: 'red',
    pixelSize: 40,
  })

  // Add lots of children
  let offsetX = 1
  Array.apply(null, Array(200)).map((item, index) => scene.create({
    t: 'text',
    id: `textChild-${index}`,
    x: offsetX * index,
    y: 300,
    parent: newNode,
    text: 'We are many!',
    textColor: 'yellow',
    pixelSize: 40,
  }))


  scene.on('onClose', () => console.log('Hello got OnClose'))
})
