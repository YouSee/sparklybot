var fs = require('fs')
var path = require('path')
var babel = require('@babel/core')
var sparkplugin = require('./sparkTransformPlugin')

// Method to transpile Spark application for sparklybot support
export const transformSparkApplicationFile = (
  file: string,
  shouldTransform: boolean,
) => {
  if (!file) throw new Error('Missing file input, cannot transpile')
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err: Error, data: any) => {
      if (err) reject(err)

      // convert from a buffer to a string
      var src = data.toString()

      if (!shouldTransform) resolve(src)

      // use our plugin to transform the source
      babel.transform(
        src,
        {
          filename: path.basename(file),
          plugins: [sparkplugin],
        },
        (error: Error, result: any) => {
          if (error) reject(error)
          resolve(result.code)
        },
      )
    })
  })
}

export const transformSparkCode = (basename: string, code: string) => {
  if (!code) throw new Error('Nothing to transform')
  return new Promise((resolve, reject) => {
    babel.transform(
      code,
      {
        filename: basename,
        plugins: [sparkplugin],
      },
      (error: Error, result: any) => {
        if (error) reject(error)
        resolve(result.code)
      },
    )
  })
}
