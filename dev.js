const _ = require('lodash')
const { build } = require('./build')
const finalhandler = require('finalhandler')
const http = require('http')
const livereload = require('livereload')
const log = require('debug')('app:watch')
const path = require('path')
const serveStatic = require('serve-static')
const watch = require('node-watch')

function getenv (key, defaultval) {
  return _.get(process, ['env', key], defaultval)
}

async function main () {
  await build()
  log('build finsh')

  const publicDir = path.resolve(__dirname, 'dist') // C:\Users\Joyce\Desktop\Yuan\pug\dist
  console.log(path.resolve(__dirname, 'dist'))
  const baseUrl = getenv('BASEURL', 'https://lyccccc17.github.io/pug/')

  const livereloadServer = livereload.createServer({
    delay: 1000,
    port: 3000,
    server: http.createServer(async (req, res) => {
      // Serve up <publicDir> folder
      serveStatic(publicDir, {
        index: ['index.html', 'index.htm'],
      })(req, res, finalhandler(req, res))
    }),
  })
  livereloadServer.watch(publicDir)

  console.log('watch')
  watch(['./src', './public'], { recursive: true }, async (evt, name) => {
    const match = name.match(/^src[\\/](.+)\.pug$/)
    await build()
    if (!match) log(`${name} changed.`)
    else log(`${baseUrl}${match[1].replace(/\\/g, '/')}.html`)
  })
}

main()
