import childProcess from 'child_process'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import rimraf from 'rimraf'
import { createHash } from 'crypto'
import ImageComposer from './image-composer'

/**
 * Helper function to create reusable image resizer
 */
const createImageResizer = (width, height) => source => {
  const resized = new PNG({ width, height, fill: true })
  PNG.bitblt(source, resized, 0, 0, source.width, source.height, 0, 0)
  return resized
}

/**
 * Fills diff area with black transparent color for meaningful diff
 */
/* eslint-disable no-plusplus, no-param-reassign, no-bitwise */
const fillSizeDifference = (width, height) => image => {
  const inArea = (x, y) => y > height || x > width
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (inArea(x, y)) {
        const idx = (image.width * y + x) << 2
        image.data[idx] = 0
        image.data[idx + 1] = 0
        image.data[idx + 2] = 0
        image.data[idx + 3] = 64
      }
    }
  }
  return image
}
/* eslint-enabled */

/**
 * Aligns images sizes to biggest common value
 * and fills new pixels with transparent pixels
 */
const alignImagesToSameSize = (firstImage, secondImage) => {
  // Keep original sizes to fill extended area later
  const firstImageWidth = firstImage.width
  const firstImageHeight = firstImage.height
  const secondImageWidth = secondImage.width
  const secondImageHeight = secondImage.height
  // Calculate biggest common values
  const resizeToSameSize = createImageResizer(
    Math.max(firstImageWidth, secondImageWidth),
    Math.max(firstImageHeight, secondImageHeight),
  )
  // Resize both images
  const resizedFirst = resizeToSameSize(firstImage)
  const resizedSecond = resizeToSameSize(secondImage)
  // Fill resized area with black transparent pixels
  return [
    fillSizeDifference(firstImageWidth, firstImageHeight)(resizedFirst),
    fillSizeDifference(secondImageWidth, secondImageHeight)(resizedSecond),
  ]
}

const isFailure = ({ pass, updateSnapshot }) => !pass && !updateSnapshot

const shouldUpdate = ({ pass, updateSnapshot, updatePassedSnapshot }) =>
  (!pass && updateSnapshot) || (pass && updatePassedSnapshot)

export const diffImageToSnapshot = options => {
  const {
    receivedImageBuffer,
    snapshotIdentifier,
    snapshotsDir,
    diffDir,
    diffDirection,
    updateSnapshot = false,
    updatePassedSnapshot = false,
    customDiffConfig = {},
    failureThreshold,
    failureThresholdType,
  } = options

  let result = {}
  const baselineSnapshotPath = path.join(
    snapshotsDir,
    `${snapshotIdentifier}-snap.png`,
  )
  if (!fs.existsSync(baselineSnapshotPath)) {
    mkdirp.sync(snapshotsDir)
    fs.writeFileSync(baselineSnapshotPath, receivedImageBuffer)
    result = { added: true }
  } else {
    const diffOutputPath = path.join(diffDir, `${snapshotIdentifier}-diff.png`)
    rimraf.sync(diffOutputPath)

    const defaultDiffConfig = {
      threshold: 0.01,
    }

    const diffConfig = Object.assign({}, defaultDiffConfig, customDiffConfig)

    const rawReceivedImage = PNG.sync.read(receivedImageBuffer)
    const rawBaselineImage = PNG.sync.read(
      fs.readFileSync(baselineSnapshotPath),
    )
    const hasSizeMismatch =
      rawReceivedImage.height !== rawBaselineImage.height ||
      rawReceivedImage.width !== rawBaselineImage.width
    const imageDimensions = {
      receivedHeight: rawReceivedImage.height,
      receivedWidth: rawReceivedImage.width,
      baselineHeight: rawBaselineImage.height,
      baselineWidth: rawBaselineImage.width,
    }
    // Align images in size if different
    const [receivedImage, baselineImage] = hasSizeMismatch
      ? alignImagesToSameSize(rawReceivedImage, rawBaselineImage)
      : [rawReceivedImage, rawBaselineImage]
    const imageWidth = receivedImage.width
    const imageHeight = receivedImage.height
    const diffImage = new PNG({ width: imageWidth, height: imageHeight })

    let pass = false
    let diffSize = false
    let diffRatio = 0
    let diffPixelCount = 0

    const receivedImageDigest = createHash('sha1')
      .update(receivedImage.data)
      .digest('base64')
    const baselineImageDigest = createHash('sha1')
      .update(baselineImage.data)
      .digest('base64')

    pass = receivedImageDigest === baselineImageDigest

    if (!pass) {
      diffPixelCount = pixelmatch(
        receivedImage.data,
        baselineImage.data,
        diffImage.data,
        imageWidth,
        imageHeight,
        diffConfig,
      )

      const totalPixels = imageWidth * imageHeight
      diffRatio = diffPixelCount / totalPixels
      // Always fail test on image size mismatch
      if (hasSizeMismatch) {
        pass = false
        diffSize = true
      } else if (failureThresholdType === 'pixel') {
        pass = diffPixelCount <= failureThreshold
      } else if (failureThresholdType === 'percent') {
        pass = diffRatio <= failureThreshold
      } else {
        throw new Error(
          `Unknown failureThresholdType: ${failureThresholdType}. Valid options are "pixel" or "percent".`,
        )
      }
    }

    if (isFailure({ pass, updateSnapshot })) {
      mkdirp.sync(diffDir)
      const composer = new ImageComposer({
        direction: diffDirection,
      })

      composer.addImage(baselineImage, imageWidth, imageHeight)
      composer.addImage(diffImage, imageWidth, imageHeight)
      composer.addImage(receivedImage, imageWidth, imageHeight)

      const composerParams = composer.getParams()

      const compositeResultImage = new PNG({
        width: composerParams.compositeWidth,
        height: composerParams.compositeHeight,
      })

      // copy baseline, diff, and received images into composite result image
      composerParams.images.forEach((image, index) => {
        PNG.bitblt(
          image.imageData,
          compositeResultImage,
          0,
          0,
          image.imageWidth,
          image.imageHeight,
          composerParams.offsetX * index,
          composerParams.offsetY * index,
        )
      })
      // Set filter type to Paeth to avoid expensive auto scanline filter detection
      // For more information see https://www.w3.org/TR/PNG-Filters.html
      const pngBuffer = PNG.sync.write(compositeResultImage, { filterType: 4 })
      fs.writeFileSync(diffOutputPath, pngBuffer)

      result = {
        pass: false,
        diffSize,
        imageDimensions,
        diffOutputPath,
        diffRatio,
        diffPixelCount,
      }
    } else if (shouldUpdate({ pass, updateSnapshot, updatePassedSnapshot })) {
      mkdirp.sync(snapshotsDir)
      fs.writeFileSync(baselineSnapshotPath, receivedImageBuffer)
      result = { updated: true }
    } else {
      result = {
        pass,
        diffRatio,
        diffPixelCount,
        diffOutputPath,
      }
    }
  }
  return result
}

export const runDiffImageToSnapshot = options => {
  options.receivedImageBuffer = options.receivedImageBuffer.toString('base64')

  const serializedInput = JSON.stringify(options)

  let result = {}

  const writeDiffProcess = childProcess.spawnSync(
    process.execPath,
    [`${__dirname}/diff-process.js`],
    {
      input: Buffer.from(serializedInput),
      stdio: ['pipe', 'inherit', 'inherit', 'pipe'],
    },
  )

  if (writeDiffProcess.status === 0) {
    const output = writeDiffProcess.output[3].toString()
    result = JSON.parse(output)
  } else {
    throw new Error('Error running image diff.')
  }

  return result
}
