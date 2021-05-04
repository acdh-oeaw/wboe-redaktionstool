import Vue from 'vue'
import { remote } from 'electron'
import fPath from 'path'
import _ from 'lodash'
const fs = remote.require('fs')
const sax = require('sax')
sax.MAX_BUFFER_LENGTH = 128 * 1024

const localFunctions = {
  init (options) {
    this.update(options)
  },
  update (options) {
    this.ready = false
    this.basePath = options.projectPath
    this.parserPath = options.parserPath
    this.paths = {loading: true, children: []}
    this.parser = null
    this.errors = {}
    if (!fs.existsSync(this.basePath)) {
      this.errors.basePath = '"' + this.basePath + '" existiert nicht!'
    }
    if (!fs.existsSync(this.parserPath)) {
      this.errors.parserPath = '"' + this.parserPath + '" existiert nicht!'
    }
    this.updatePaths(true)
    this.ready = Object.keys(this.errors).length === 0
  },
  updatePaths (all = true) {
    updateDir(this.basePath, this.paths, all)
  },
  openPath (fileObj) {
    fileObj.isOpen = true
    fileObj.update = true
    updateDir(fileObj.fullFileName, fileObj, true)
  }
}

function lowerSort (a, b) {
	if (a.file.toLowerCase() > b.file.toLowerCase()) { return 1 }
	if (a.file.toLowerCase() < b.file.toLowerCase()) { return -1 }
	return 0
}

function updateDir (path, pObj, all) {
  pObj.loading = true
  var aPaths = []
  var aFiles = []
  let fileUpdateCount = 0
  fs.readdir(path, (e, files) => {
    if (e) return console.error(e)
    files.forEach(f => {
      var aFullFileName = fPath.join(path, f)
			try {
				var stats = fs.statSync(aFullFileName)
			} catch (e) {
				stats = null
				console.log(e)
			}
			if (stats) {
				if (stats.isDirectory()) {
					aPaths.push({
						file: f,
						fullFileName: aFullFileName,
            path: path,
            atime: stats.atime,
						size: stats.size,
            isDir: true
					})
				} else {
					let aExt = f.split('.').pop()
					if (aExt === 'xml') {
						aFiles.push({
							file: f,
							ext: aExt,
							fullFileName: aFullFileName,
							path: path,
              atime: stats.atime,
							size: stats.size,
						})
					}
				}
      }
    })
    let nArr = []
    aFiles = aFiles.slice().sort(lowerSort)
    aPaths = aPaths.slice().sort(lowerSort)
    let aComb = [...aPaths, ...aFiles]
    let firstFile = true
    aComb.forEach(d => {
      let aArrObj = pObj.children.filter(p => (p.fullFileName === d.fullFileName && p.isDir === d.isDir))
      if (aArrObj.length < 1) {
        aArrObj = {}
        Vue.set(aArrObj, 'info', null)
        Vue.set(aArrObj, 'sInfo', null)
        Vue.set(aArrObj, 'isOpen', false)
        Vue.set(aArrObj, 'loading', false)
        Vue.set(aArrObj, 'update', true)
      } else {
        aArrObj = aArrObj[0]
        if (all) {
          Vue.set(aArrObj, 'update', true)
        }
      }
      Vue.set(aArrObj, 'file', d.file)
      Vue.set(aArrObj, 'fullFileName', d.fullFileName)
      Vue.set(aArrObj, 'path', d.path)
      Vue.set(aArrObj, 'atime', d.atime)
      Vue.set(aArrObj, 'size', d.size)
      if (d.ext) {
        Vue.set(aArrObj, 'ext', d.ext)
        if (firstFile) {
          Vue.set(aArrObj, 'firstFile', true)
          firstFile = false
        }
      }
      if (d.isDir) {
        Vue.set(aArrObj, 'isDir', d.isDir)
        if (!aArrObj.children) {
          Vue.set(aArrObj, 'children', [])
        }
        if (aArrObj.isOpen && aArrObj.update) {
          updateDir(aArrObj.fullFileName, aArrObj, true)
        }
      } else {
        if (aArrObj.update) {
          aArrObj.sInfo = {
            'status': '?',
            'editor': '?',
            'version': '?',
            'comments': [],
            'errors': []
          }
          _.debounce(() => {
            updateFileInfos(aArrObj.fullFileName, aArrObj)
          }, 100 + 20 * fileUpdateCount)()
          fileUpdateCount += 1
        }
      }
      nArr.push(aArrObj)
    })
    Vue.set(pObj, 'children', nArr)
    Vue.set(pObj, 'loading', false)
    Vue.set(pObj, 'update', false)
    // console.log(pObj)
  })
}

function updateFileInfos (file, pObj) {
  if (!pObj.loading) {
    pObj.loading = true
    pObj.sInfo = {
      'status': '?',
      'editor': '?',
      'version': '?',
      'parserVersion': '?-?',
      'comments': [],
      'errors': []
    }
    // let sTime = performance.now()
    fs.readFile(file, 'utf8', (err, data) => {
      // let pTime = performance.now()
      // data = data.replace(/\r/gmi, '')
      if (err) {
        pObj.sInfo.errors.push('readFile - Lese Fehler!')
        return console.log(err)
      }
      let parser = sax.parser(false, { lowercase: true })
      let inRespStmt = false
      let inRespStmtName = false
      let inResp = false
      let aResp = ''
      let lWhen = 0
      parser.onerror = (e) => {
        console.log('saxes error:', { file, e, pObj })
        pObj.sInfo.errors.push('XML Fehler!\n' + e.message)
      }
      parser.onopentag = (node) => {
        if (node.name === 'respstmt') {
          inRespStmt = true
        } else if (inRespStmt && node.name === 'resp') {
          inResp = true
        } else if (inRespStmt && node.name === 'name') {
          inRespStmtName = true
        } else if (node.name === 'change') {
          if (node.attributes && node.attributes.when && node.attributes.status) {
            let aWhen = parseInt(node.attributes.when.split('-').join(''))
            if (aWhen >= lWhen) {
              pObj.sInfo.status = node.attributes.status.trim()
            }
          }
        }
      }
      parser.ontext = (txt) => {
        if (inResp) {
          aResp = txt.trim()
        }
        if (inRespStmtName && aResp === 'Editor') {
          pObj.sInfo.editor = txt.trim()
        }
      }
      parser.onclosetag = (tag) => {
        if (tag === 'resp') {
          inResp = false
        }
        if (tag === 'respStmt') {
          inRespStmt = false
        }
        if (inRespStmt && tag === 'name') {
          inRespStmtName = false
        }
      }
      parser.onprocessinginstruction = (node) => {
        if (node.name === 'redaktionstool') {
          let m = node.body.match(/version\n*=\n*"([0-9.a-zA-Z]+)"/mi)
          if (m && m[1]) {
            pObj.sInfo.version = m[1]
          }
        } else if (node.name === 'parser') {
          let m = node.body.match(/version\n*=\n*"([0-9.a-zA-Z]+)"/mi)
          let m2 = node.body.match(/type\n*=\n*"([0-9.a-zA-Z]+)"/mi)
          pObj.sInfo.parserVersion = (m2 && m2[1] ? m2[1] : '?') + '-' + (m && m[1] ? m[1] : '?')
        } else if (node.name === 'comment') {
          if (node.body && node.body.trim().length > 0) {
            pObj.sInfo.comments.push(node.body.trim())
          }
        }
      }
      parser.onend = () => {
        // console.log(pObj.file, pObj, parseInt(performance.now() - pTime) + ' ms - ' + parseInt(performance.now() - sTime) + ' ms')
        Vue.set(pObj, 'update', false)
        Vue.set(pObj, 'loading', false)
      }
      parser.write(data).close()
    })
  }
}

export default localFunctions
