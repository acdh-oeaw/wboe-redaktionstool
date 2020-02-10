import ParserObject from '@/functions/parser/Parser'
import { remote } from 'electron'
import fPath from 'path'
const fs = remote.require('fs')
const fse = remote.require('fs-extra')
const { dialog } = remote

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
	LOAD_PARSER_FILE ({ commit, dispatch, rootState }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
		var aPath = rootState.Options.projectPath
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
			}
		}
		if (fileContent) {
			fileContent = local.loadImportFiles(fileContent, aPath)[1]
		}
		if (fileContent) {
			aParser = new ParserObject.ParserBase(fileContent, aFile, rootState.Options.additionalFilesDirectory)
		}
		console.log('LOAD_PARSER_FILE', aFile, (fileContent !== state.content))
		commit('SET_PARSER_FILE', { file: aFile, content: fileContent, parser: aParser })
	},
	RELOAD_PARSER_FILE ({ commit, dispatch }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
		commit('SET_PARSER_FILE', { file: null, content: null, parser: null })
		dispatch('LOAD_PARSER_FILE')
	},
	DIALOG_SAVE_PARSER ({ commit, dispatch, rootState }) {		// Dialog öffnen um aktuellen Parser zu speichern
		var saveFolder = dialog.showOpenDialog({
			title: 'Verzeichniss zum speichern der Parser Dateien auswählen',
			defaultPath: rootState.Options.projectPath,
			properties: ['openDirectory']
		})
		if (saveFolder && saveFolder[0]) {
			saveFolder = saveFolder[0]
			var folderState = fs.statSync(saveFolder)
			if (folderState && folderState.isDirectory) {
				if (folderState.isDirectory()) {
					try {
						if (state.parser) {
							let aFiles = [{name: 'parser.xml', fullFileName: fPath.join(__static, '/parser.xml')}]
							let fileContent = fs.readFileSync(aFiles[0].fullFileName, 'utf8')
							aFiles = [...aFiles, ...local.loadImportFiles(fileContent, __static)[2]]
							Object.keys(state.parser.additionalFiles).forEach(function (addFileKey) {
								aFiles.push({'name': addFileKey, 'fullFileName': state.parser.additionalFiles[addFileKey].fullFileName})
							}, this)
							console.log('Parser speichern ...', saveFolder, aFiles)
							aFiles.forEach(function (sFile) {
								console.log('sFile', sFile)
								fse.copySync(sFile.fullFileName, fPath.join(saveFolder, sFile.name), {'overwrite': false})
							}, this)
							dispatch('RELOAD_PARSER_FILE')
						} else {
							alert('Parser nicht geladen!')
						}
					} catch (e) {
						console.log(e)
						alert('Dateien konnten nicht gespeichert werden!')
					}
				} else {
					alert('Auswahl ist kein Verzeichniss!', 'Fehler!')
				}
			} else {
				alert('Fehler beim auswählen des Verzeichnisses!\n\n' + JSON.stringify(folderState), 'Fehler!')
			}
		}
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
