var fs = require('fs')
var path = require('path')
var babel = require('@babel/core')
var sparkplugin = require('./sparkTransformPlugin')

// read the filename from the command line arguments
//var fileName = process.argv[2]

// read the code from this file
fs.readFile(path.resolve(__dirname, './example.js'), function(err, data) {
  if(err) throw err

  // convert from a buffer to a string
  var src = data.toString()

  // use our plugin to transform the source
  var out = babel.transformSync(src, {
    filename: 'example.js',
    plugins: [sparkplugin],
  })
  
  console.log(out.code)
})