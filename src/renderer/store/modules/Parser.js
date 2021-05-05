import ParserObject from '@/functions/parser/Parser'
import { remote } from 'electron'
import fPath from 'path'
const fs = remote.require('fs')
const XLSX = require('xlsx')

const state = {
	file: null,
	content: null,
	parser: null,
}

const mutations = {
	SET_PARSER_FILE: (state, { file, content, parser }) => {		// Aktuelle Datei laden
		state.file = file
		state.content = content
		state.parser = parser
	},
}

const actions = {
	LOAD_PARSER_FILE ({ commit, dispatch, rootState }) {
		var aPath = rootState.Options.parserPath
		var aFile = fPath.join(aPath, '/parser.xml')
		let fileContent = null
		var aParser = null
		try {
			fileContent = fs.readFileSync(aFile, 'utf8')
		} catch (e) {
			try {
				aFile = fPath.join(__static, '/parser.xml')
				fileContent = fs.readFileSync(aFile, 'utf8')
				aPath = __static
			} catch (e) {
				console.log(e)
				alert('Konnte Parser Datei nicht laden!')
			}
		}
		if (fileContent) {
			fileContent = local.loadImportFiles(fileContent, aPath)[1]
		}
		if (fileContent) {
			let getAdditionalFile = function (lFile) {
				let fContent = {}
				fContent.fullFileName = fPath.join(this.orgPath, lFile)
				fContent.ext = lFile.split('.').pop()
				if (fContent.ext === 'xlsx' || fContent.ext === 'xls') {
					try {
						// let t0 = performance.now()
						let aXLSX = XLSX.readFile(fContent.fullFileName)
						// let t1 = performance.now()
						fContent.JSON = XLSX.utils.sheet_to_json(aXLSX.Sheets[aXLSX.SheetNames[0]])
						Object.seal(fContent.JSON)
						Object.preventExtensions(fContent.JSON)
						// console.log('XLSX laden: ' + Math.ceil(t1 - t0) + ' ms. > JSON: ' + Math.ceil(performance.now() - t1) + ' ms.')
					} catch (e) {
						fContent.error = 'Datei "' + fContent.fullFileName + '" konnte nicht geladen werden! (xlsx)'
						console.log(e)
					}
				}
				return fContent
			}
			aParser = new ParserObject.ParserBase(fileContent, aFile, getAdditionalFile)
		}
		console.log('LOAD_PARSER_FILE', aFile, (fileContent !== state.content))
		commit('SET_PARSER_FILE', { file: aFile, content: fileContent, parser: aParser })
	},
	RELOAD_PARSER_FILE ({ commit, dispatch }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
		commit('SET_PARSER_FILE', { file: null, content: null, parser: null })
		dispatch('LOAD_PARSER_FILE')
	}
}

const local = {
	loadImportFiles (fileContent, aPath, files = []) {
		let imported = false
		fileContent = fileContent.replace(/<\?import ".+" \?>/gi, function (imp) {
			let impFile = imp.match(/<\?import "(.+\.xml)" \?>/)[1]
			let impFullFile = impFile
			if (impFile) {
				let nFileContent = null
				try {
					impFullFile = fPath.join(aPath, '/' + impFile)
					nFileContent = fs.readFileSync(impFullFile, 'utf8')
					files.push({name: impFile, fullFileName: impFullFile})
				} catch (e) {
					console.log(e)
				}
				if (nFileContent) {
					imp = nFileContent.replace(/<\?xml.+\?>/, '')
					imported = true
				} else {
					console.log('Fehler!', 'Konnte Datei "' + impFullFile + '" nicht laden ...')
				}
			} else {
				console.log('Fehler!', 'Keine Datei gefunden!', imp, impFullFile)
			}
			return imp
		})
		if (imported) {
			let sGIF = local.loadImportFiles(fileContent, aPath)
			fileContent = sGIF[1]
			files = [...files, ...sGIF[2]]
		}
		return [imported, fileContent, files]
	}
}

export default {
	state,
	mutations,
	actions
}
