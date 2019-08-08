# :sparkles: SparklyBot :sparkles:

An automation framework for testing [Spark](https://www.sparkui.org/) UI Applications.

## Installation

Sparklybot is a set of tools which can be used together with any test framework of your choice (Jest, Ava, Mocha etc.)

Installation is simple:

```
npm install sparklybot --save-dev
```

## Documentation (Jest examples)

Below is an example of testing an helloworld app with jest

helloworld.js:
```javascript
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
```

helloworld.test.js:
```javascript
import path from 'path'
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  findElementWithPropertyValue,
  stopServerAndBrowser,
} from 'sparklybot'

beforeEach(async done => {
  await initializeSparkTestBrowser()
  done()
})

afterEach(async done => {
  await stopServerAndBrowser()
  done()
})

test('Should be able to assert on element', async done => {
  await refreshSparkBrowser(
    path.resolve(__dirname, './helloWorld.js'),
  )
  const element = await findElementWithPropertyValue('text', 'Hello World!')
  expect(element).toBeTruthy()
  expect(element.id).toBe('my-test-id')
  done()
})
```

It's also possible to test Spark applications served from a webpage, either remote or local:

```javascript
import {
  initializeSparkTestBrowser,
  refreshSparkBrowser,
  findElementWithPropertyValue,
  stopServerAndBrowser,
} from 'sparklybot'

beforeEach(async done => {
  await initializeSparkTestBrowser()
  done()
})

afterEach(async done => {
  await stopServerAndBrowser()
  done()
})

test('Wait for specific image to be displayed', async done => {
  await refreshSparkBrowser(
    'https://www.sparkui.org/examples/polaroid/pp_polaroid.js',
  )
  // Wait for specific element to be rendered in browser
  const element = await findElementWithPropertyValue(
    'text',
    "A '99' Ice Cream - Dingle, Ireland",
    20000, // Set custom maxTimeout
  )
  expect(element).toBeTruthy()
  done()
})
```

## Test automation on CI

There's an experimental docker image ready for CI testing on dockerhub: ```docker pull renegus/spark```

An example of how to use it can be found in here: [CircleCI config](.circleci/config.yml)

Remember when running tests on CI you need to specify environment variable ```PXSCENE_PATH```

## More examples

Please refer to tests found in folder: [Test examples](test/)

## API documentation

Comming soon!