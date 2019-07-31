var fs = require('fs')
var path = require('path')
var babel = require('@babel/core')
var sparkplugin = require('./sparkTransformPlugin')

// Method to transpile Spark application for sparklybot support
export const transformSparkApplication = (file, shouldTransform) => {
  if (!file) throw new Error('Missing file input, cannot transpile')
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if(err) reject(err)
    
      // convert from a buffer to a string
      var src = data.toString()

      if (!shouldTransform) resolve(src)
    
      // use our plugin to transform the source
      babel.transform(src, {
        filename: path.basename(file),
        plugins: [sparkplugin],
      }, (error, result) => {
        if (error) reject(error)
        resolve(result.code)
      })
    })
  })
}
