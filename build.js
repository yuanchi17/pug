const _ = require('lodash')
const fg = require('fast-glob')

exports.build = async () => {
  const pugFiles = _.map(_.filter(await fg('src/**/*.pug'), file => {
    if (/\/(layout|compoment)-[^/]+\.pug$/.test(file)) return false
    return true
  }), file => file.slice(4)) // [ 'src/test.pug' ] => [ 'test.pug' ]

  for (const file of pugFiles) {
    try {
      const html = pug.renderFile(path.resolve(__dirname, 'src', file), PUG_OPTIONS)
      const dist = path.resolve(__dirname, 'dist', file.replace(/\.pug$/, '.html'))
      
    }
  }
}
