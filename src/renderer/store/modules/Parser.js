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
		var aFile = fPath.join(rootState.Options.projectPath, '/parser.xml')
		let fileContent = null
		var aParser = null
		try {
			fileContent = fs.readFileSync(aFile, 'utf8')
		} catch (e) {
			try {
				aFile = fPath.join(__static, '/parser.xml')
				fileContent = fs.readFileSync(aFile, 'utf8')
			} catch (e) {
				console.log(e)
			}
		}
		if (fileContent) {
			if (fileContent === state.content && aFile === state.file) {
				aParser = state.parser
			} else {
				aParser = new ParserObject.ParserBase(fileContent, aFile)
			}
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
							let aFiles = [{'name': 'parser.xml', 'fullFileName': fPath.join(__static, '/parser.xml')}]
							Object.keys(state.parser.additionalFiles).forEach(function (addFileKey) {
								aFiles.push({'name': addFileKey, 'fullFileName': state.parser.additionalFiles[addFileKey].fullFileName})
							}, this)
							console.log('Parser speichern ...', saveFolder, aFiles)
							aFiles.forEach(function (sFile) {
								console.log(fs)
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

export default {
	state,
	mutations,
	actions
}
