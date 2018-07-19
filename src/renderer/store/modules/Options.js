import { remote } from 'electron'
import fPath from 'path'
const fs = remote.require('fs')
const { dialog } = remote
const Store = require('electron-store')
const store = new Store()

const state = {
	projectPath: undefined,
	parserFile: undefined,
	parserFileContent: undefined,
	useFile: undefined,
	useFileContent: undefined
}

const mutations = {
	SET_USE_FILE: (state, { file, content }) => {		// Aktuelle Datei zum bearbeiten setzen und cachen
		state.useFile = file
		state.useFileContent = content
	},
	SET_PROJECT_PATH: (state, { projectPath }) => {		// Aktuellen Projektpfad setzen
		state.projectPath = projectPath
	},
	SET_PARSER: (state, { file, content }) => {		// Aktuellen Parser setzen und cachen
		state.parserFile = file
		state.parserFileContent = content
	},
}

const actions = {
	SET_USE_FILE: function ({ commit }, file) {		// Aktuelle Datei zum bearbeiten setzen und cachen
		var aFile = file
		let fileContents = undefined
		try {
			fileContents = fs.readFileSync(aFile, 'utf8')
		} catch (e) {
			try {
				// ToDo: Keine Demodaten laden!
				aFile = fPath.join(__static, '/demo.xml')
				fileContents = fs.readFileSync(aFile, 'utf8')
			} catch (e) {
				console.log(e)
			}
		}
		commit('SET_USE_FILE', { file: aFile, content: fileContents })
	},
	UNSET_USE_FILE: function ({ commit }, file) {		// Aktuelle Datei zum bearbeiten aufheben
		commit('SET_USE_FILE', { file: undefined, content: undefined })
	},
	GET_PROJECT_PATH: function ({ commit, dispatch }) {		// Aktuellen Projektpfad aus den "store" laden
		commit('SET_PROJECT_PATH', { projectPath: store.get('projectPath', remote.app.getPath('userData')) })
		dispatch('GET_PARSER_FILE')
	},
	SET_PROJECT_PATH: function ({ commit, dispatch }) {		// Aktuellen Projektpfad neu setzen und in den "store" speichern
		store.set('projectPath', state.projectPath)
		dispatch('GET_PARSER_FILE')
	},
	DIALOG_PROJECT_PATH: function ({ commit, dispatch }) {		// Dialog zur auswahl einens neuen Projektpfads öffnen
		var newFolder = dialog.showOpenDialog({
			title: 'Projekt Verzeichniss auswählen',
			defaultPath: state.projectPath,
			properties: ['openDirectory']
		})
		if (newFolder === undefined) return
		var folderState = fs.statSync(newFolder[0])
		if (folderState && folderState.isDirectory) {
			if (folderState.isDirectory()) {
				commit('SET_PROJECT_PATH', { projectPath: newFolder[0] })
				dispatch('GET_PARSER_FILE')
			} else {
				alert('Auswahl ist kein Verzeichniss!', 'Fehler!')
			}
		} else {
			alert('Fehler beim auswählen des Verzeichnisses!\n\n' + JSON.stringify(folderState), 'Fehler!')
		}
	},
	GET_PARSER_FILE: function ({ commit, dispatch }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
		var aFile = fPath.join(state.projectPath, '/parser.xml')
		let fileContents = undefined
		try {
			fileContents = fs.readFileSync(aFile, 'utf8')
		} catch (e) {
			try {
				aFile = fPath.join(__static, '/parser.xml')
				fileContents = fs.readFileSync(aFile, 'utf8')
			} catch (e) {
				console.log(e)
			}
		}
		console.log('GET_PARSER_FILE', aFile)
		commit('SET_PARSER', { file: aFile, content: fileContents })
	},
	DIALOG_SAVE_PARSER: function ({ commit, dispatch }) {		// Dialog öffnen um aktuellen Parser zu speichern
		var saveFile = dialog.showSaveDialog({
			title: 'Parser Datei speichern',
			defaultPath: fPath.join(state.projectPath, '/parser.xml')
		})
		if (saveFile) {
			try {
				fs.writeFileSync(saveFile, state.parserFileContent, 'utf-8')
			} catch (e) {
				console.log(e)
				alert('Datei konnte nicht gespeichert werden!')
			}
		}
	}
}

export default {
	state,
	mutations,
	actions
}
