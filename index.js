const express = require('express')
var fs = require('fs')
var path = require('path')

const traditional_chinese = require('./dictionary/zh-TW')
const simplified_chinese = require('./dictionary/zh-CN')

var sourcefilePath = path.resolve('/Users/davis/Documents/projects/kzb-fp-h5')
let targetFilePath = path.resolve('/Users/davis/Documents/projects/convert-output')
let filter = ['.js', '.vue', '.json']

delDir(targetFilePath)
fs.mkdirSync(targetFilePath)

//呼叫檔案遍歷方法
fileDisplay(sourcefilePath, targetFilePath)

function fileDisplay(srcDir, tarDir) {
  //根據檔案路徑讀取檔案，返回檔案列表
  fs.readdir(srcDir, function (err, files) {
    if (err) {
      console.warn(err)
    } else {
      //遍歷讀取到的檔案列表
      files.forEach(function (filename) {
        let srcPath = path.join(srcDir, filename)
        let tarPath = path.join(tarDir, filename)

        //根據檔案路徑獲取檔案資訊，返回一個fs.Stats物件
        fs.stat(srcPath, function (eror, stats) {
          if (eror) {
            console.warn('獲取檔案stats失敗')
          } else {
            var isFile = stats.isFile() //是檔案
            var isDir = stats.isDirectory() //是資料夾
            if (isFile) {
              if (filter.indexOf(path.extname(filename)) > -1) {
                console.log(srcPath + '  @@  ' + tarPath)
                let rs = fs.createReadStream(srcPath)
                let str = ''
                rs.on('data', (chunk) => {
                  str += chunk
                })
                rs.on('end', (chunk) => {
                  var options = {
                    type: 't2s',
                    str: '',
                    language: ''
                  }
                  options.str = str.toString()
                  let source,
                    target,
                    result = '',
                    hash = {}
                  source = traditional_chinese.default
                  target = simplified_chinese.default
                  for (var i = 0, len = options['str'].length; i < len; i++) {
                    var c = options['str'][i]
                    if (hash[c]) {
                      c = hash[c]
                    } else {
                      var index = source.indexOf(c)
                      if (index > -1) {
                        c = hash[c] = target[index]
                      }
                    }
                    result += c
                    i += c.length - 1
                  }
                  let ws = fs.createWriteStream(tarPath)
                  ws.write(result)
                  ws.end()
                })
                fs.readFileSync(srcPath, (err, data) => {
                  if (err) {
                    console.log('讀取檔案錯誤')
                    return
                  }
                  var options = {
                    type: 't2s',
                    str: '',
                    language: ''
                  }
                  options.str = data.toString()
                  let source,
                    target,
                    result = '',
                    hash = {}
                  source = traditional_chinese.default
                  target = simplified_chinese.default
                  for (var i = 0, len = options['str'].length; i < len; i++) {
                    var c = options['str'][i]
                    if (hash[c]) {
                      c = hash[c]
                    } else {
                      var index = source.indexOf(c)
                      if (index > -1) {
                        c = hash[c] = target[index]
                      }
                    }
                    result += c
                    i += c.length - 1
                  }
                  fs.writeFileSync(tarPath, result.toString(), function () {})
                })
              } else {
                fs.copyFile(srcPath, tarPath, (err) => {
                  if (err) throw err
                  console.log(srcPath + ' was copied to ' + tarPath)
                })
              }
            }
            if (isDir) {
              fs.mkdir(tarPath, { recursive: true }, (err) => {
                if (err) throw err
              })
              fileDisplay(srcPath, tarPath) //遞迴，如果是資料夾，就繼續遍歷該資料夾下面的檔案
            }
          }
        })
      })
    }
  })
}

function delDir(path) {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach((file, index) => {
      let curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath) //遞迴刪除資料夾
      } else {
        fs.unlinkSync(curPath) //刪除檔案
      }
    })
    fs.rmdirSync(path)
  }
}
