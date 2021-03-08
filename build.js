require('dotenv').config() // process.env

const _ = require('lodash')
const fg = require('fast-glob')
const fsPromises = require('fs').promises
const log = require('debug')('app:index')
const ncp = require('ncp').ncp
const path = require('path')
const pug = require('pug')

ncp.limit = 16

// source: File path of the source folder.
// destination: File path of destination folder.
function ncpAsync (source, destination, options) {
  return new Promise((resolve, reject) => {
    ncp(source, destination, options, err => err ? reject(err) : resolve())
  })
    .catch(err => console.log('ncpAsync catch', err))
}

function getenv (key, defaultval) {
  return _.get(process, ['env', key], defaultval)
}

exports.build = async () => {
  const PUG_OPTIONS = {
    basedir: path.resolve(__dirname, 'src'),
    baseUrl: getenv('BASEURL', 'https://yuanchi17.github.io/pug/'),
    GA_MEASUREMENT_ID: getenv('GA_MEASUREMENT_ID', 'UA-164526128-1'),
    LIFFID_FULL: getenv('LIFFID_FULL'),
    NODE_ENV: getenv('NODE_ENV', 'production'),
  }

  // copy public files
  await ncpAsync('public', 'dist', {
    stopOnErr: true, // { stopOnErr: true }：ncp 在遇到第一個 err 時停止
  })

  // 找出 src 裡的 pug 檔
  const pugFiles = _.map(_.filter(await fg('src/**/*.pug'), file => {
    if (/\/(layout|compoment)-[^/]+\.pug$/.test(file)) return false
    return true
  }), file => file.slice(4)) // [ 'src/test.pug' ] => [ 'test.pug' ]

  // 編譯 pug 檔
  for (const file of pugFiles) {
    try {
      const html = pug.renderFile(path.resolve(__dirname, 'src', file), PUG_OPTIONS) // __dirname：當前執行文件所在目錄的完整目錄位置
      const dist = path.resolve(__dirname, 'dist', file.replace(/\.pug$/, '.html'))
      await fsPromises.mkdir(path.dirname(dist), { recursive: true }) // { recursive: <boolean> }：是否創建父文件夾
      await fsPromises.writeFile(dist, html)
    } catch (err) {
      log(file, err)
      throw err
    }
  }
}
