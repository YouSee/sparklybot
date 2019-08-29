/* eslint-disable no-underscore-dangle */
import kebabCase from 'lodash/kebabCase'
import merge from 'lodash/merge'
import path from 'path'
import fs from 'fs'
import { diffImageToSnapshot, runDiffImageToSnapshot } from './diff-snapshot'
import { stopServerAndBrowser } from '../server'
import { imageThumbnail } from '../server/utils/error'

const Chalk = require('chalk').constructor

const timesCalled = new Map()

const SNAPSHOTS_DIR = '__image_snapshots__'

function updateSnapshotState(originalSnapshotState, partialSnapshotState) {
  if (global.UNSTABLE_SKIP_REPORTING) {
    return originalSnapshotState
  }
  return merge(originalSnapshotState, partialSnapshotState)
}

async function checkResult({
  result,
  snapshotState,
  retryTimes,
  snapshotIdentifier,
  chalk,
}) {
  let pass = true
  /*
    istanbul ignore next
    `message` is implementation detail. Actual behavior is tested in integration.spec.js
  */
  let message = () => ''

  if (result.updated) {
    // once transition away from jasmine is done this will be a lot more elegant and pure
    // https://github.com/facebook/jest/pull/3668
    updateSnapshotState(snapshotState, { updated: snapshotState.updated + 1 })
  } else if (result.added) {
    updateSnapshotState(snapshotState, { added: snapshotState.added + 1 })
  } else {
    ;({ pass } = result)

    updateSnapshotState(snapshotState, { matched: snapshotState.matched + 1 })

    if (!pass) {
      // Stop server
      await stopServerAndBrowser()
      const currentRun = timesCalled.get(snapshotIdentifier)
      if (!retryTimes || currentRun > retryTimes) {
        updateSnapshotState(snapshotState, {
          unmatched: snapshotState.unmatched + 1,
        })
      }

      const differencePercentage = result.diffRatio * 100
      message = () => {
        let failure
        if (result.diffSize) {
          failure =
            `Expected image to be the same size as the snapshot (${result.imageDimensions.baselineWidth}x${result.imageDimensions.baselineHeight}), but was different (${result.imageDimensions.receivedWidth}x${result.imageDimensions.receivedHeight}).\n` +
            `${chalk.bold.red('See diff for details:')} ${chalk.red(
              result.diffOutputPath,
            )}` +
            `${imageThumbnail(result.diffOutputPath, '700px')}`
        } else {
          failure =
            `Expected image to match or be a close match to snapshot but was ${differencePercentage}% different from snapshot (${result.diffPixelCount} differing pixels).\n` +
            `${chalk.bold.red('See diff for details:')} ${chalk.red(
              result.diffOutputPath,
            )}` +
            `${imageThumbnail(result.diffOutputPath, '700px')}`
        }

        return failure
      }
    }
  }

  return {
    message,
    pass,
  }
}

function createSnapshotIdentifier({
  retryTimes,
  testPath,
  currentTestName,
  customSnapshotIdentifier,
  snapshotState,
}) {
  const counter = snapshotState._counters.get(currentTestName)
  const defaultIdentifier = kebabCase(
    `${path.basename(testPath)}-${currentTestName}-${counter}`,
  )

  let snapshotIdentifier = customSnapshotIdentifier || defaultIdentifier

  if (typeof customSnapshotIdentifier === 'function') {
    const customRes = customSnapshotIdentifier({
      testPath,
      currentTestName,
      counter,
      defaultIdentifier,
    })

    if (retryTimes && !customRes) {
      throw new Error(
        'A unique customSnapshotIdentifier must be set when jest.retryTimes() is used',
      )
    }

    snapshotIdentifier = customRes || defaultIdentifier
  }

  if (retryTimes) {
    if (!customSnapshotIdentifier)
      throw new Error(
        'A unique customSnapshotIdentifier must be set when jest.retryTimes() is used',
      )

    timesCalled.set(
      snapshotIdentifier,
      (timesCalled.get(snapshotIdentifier) || 0) + 1,
    )
  }

  return snapshotIdentifier
}

function configureToMatchImageSnapshot({
  customDiffConfig: commonCustomDiffConfig = {},
  customSnapshotsDir: commonCustomSnapshotsDir,
  customDiffDir: commonCustomDiffDir,
  diffDirection: commonDiffDirection = 'horizontal',
  noColors: commonNoColors = false,
  failureThreshold: commonFailureThreshold = 0,
  failureThresholdType: commonFailureThresholdType = 'pixel',
  updatePassedSnapshot: commonUpdatePassedSnapshot = false,
  runInProcess: commonRunInProcess = false,
} = {}) {
  return function toMatchImageSnapshot(
    received,
    {
      customSnapshotIdentifier = '',
      customSnapshotsDir = commonCustomSnapshotsDir,
      customDiffDir = commonCustomDiffDir,
      diffDirection = commonDiffDirection,
      customDiffConfig = {},
      noColors = commonNoColors,
      failureThreshold = commonFailureThreshold,
      failureThresholdType = commonFailureThresholdType,
      updatePassedSnapshot = commonUpdatePassedSnapshot,
      runInProcess = commonRunInProcess,
    } = {},
  ) {
    const { testPath, currentTestName, isNot, snapshotState } = this
    const chalk = new Chalk({ enabled: !noColors })

    const retryTimes = parseInt(global[Symbol.for('RETRY_TIMES')], 10) || 0

    if (isNot) {
      throw new Error(
        'Jest: `.not` cannot be used with `.toMatchImageSnapshot()`.',
      )
    }

    updateSnapshotState(snapshotState, {
      _counters: snapshotState._counters.set(
        currentTestName,
        (snapshotState._counters.get(currentTestName) || 0) + 1,
      ),
    }) // eslint-disable-line max-len

    const snapshotIdentifier = createSnapshotIdentifier({
      retryTimes,
      testPath,
      currentTestName,
      customSnapshotIdentifier,
      snapshotState,
    })

    const snapshotsDir =
      customSnapshotsDir || path.join(path.dirname(testPath), SNAPSHOTS_DIR)
    const diffDir = customDiffDir || path.join(snapshotsDir, '__diff_output__')
    const baselineSnapshotPath = path.join(
      snapshotsDir,
      `${snapshotIdentifier}-snap.png`,
    )

    if (
      snapshotState._updateSnapshot === 'none' &&
      !fs.existsSync(baselineSnapshotPath)
    ) {
      return {
        pass: false,
        message: () =>
          `New snapshot was ${chalk.bold.red(
            'not written',
          )}. The update flag must be explicitly ` +
          'passed to write a new snapshot.\n\n + This is likely because this test is run in a continuous ' +
          'integration (CI) environment in which snapshots are not written by default.\n\n',
      }
    }

    const imageToSnapshot = runInProcess
      ? diffImageToSnapshot
      : runDiffImageToSnapshot

    const result = imageToSnapshot({
      receivedImageBuffer: received,
      snapshotsDir,
      diffDir,
      diffDirection,
      snapshotIdentifier,
      updateSnapshot: snapshotState._updateSnapshot === 'all',
      customDiffConfig: Object.assign(
        {},
        commonCustomDiffConfig,
        customDiffConfig,
      ),
      failureThreshold,
      failureThresholdType,
      updatePassedSnapshot,
    })

    return checkResult({
      result,
      snapshotState,
      retryTimes,
      snapshotIdentifier,
      chalk,
    })
  }
}

module.exports = {
  toMatchImageSnapshot: configureToMatchImageSnapshot(),
  configureToMatchImageSnapshot,
  updateSnapshotState,
}
