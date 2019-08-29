import fs from 'fs'
import getStdin from 'get-stdin'
import { diffImageToSnapshot } from './diff-snapshot'

getStdin.buffer().then(buffer => {
  try {
    const options = JSON.parse(buffer)

    options.receivedImageBuffer = Buffer.from(
      options.receivedImageBuffer,
      'base64',
    )

    const result = diffImageToSnapshot(options)

    fs.writeSync(3, Buffer.from(JSON.stringify(result)))

    process.exit(0)
  } catch (error) {
    console.error(error) // eslint-disable-line no-console
    process.exit(1)
  }
})
