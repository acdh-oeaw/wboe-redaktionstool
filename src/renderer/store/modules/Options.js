import { remote } from 'electron'
const fs = remote.require('fs')
const { dialog } = remote
const Store = require('electron-store')
const store = new Store()

const state = {
	projectPath: null,
	show: {},
	lastFile: null
}

const mutations = {
	SET_PROJECT_PATH: (state, { projectPath }) => {		// Aktuellen Projektpfad setzen
		state.projectPath = projectPath
	},
	SET_SHOW: (state, { show }) => {
		state.show = show
	},
	SET_LASTFILE: (state, { filename }) => {
		state.lastFile = filename
	},
}

const actions = {
	LOAD_LASTFILE: function ({ commit }) {
		commit('SET_LASTFILE', { 'filename': store.get('lastFilename', null) })
	},
	SET_LASTFILE: function ({ commit }, filename) {
		store.set('lastFilename', filename)
		commit('SET_LASTFILE', { 'filename': filename })
	},
	LOAD_SHOW: function ({ commit }) {
		commit('SET_SHOW', { 'show': store.get('show', { 'professional': true }) })
	},
	TOGGLE_SHOW: function ({ commit }, obj) {
		var aShow = JSON.parse(JSON.stringify(state.show))
		aShow[obj] = !aShow[obj]
		store.set('show', aShow)
		commit('SET_SHOW', { 'show': aShow })
	},
	GET_PROJECT_PATH: function ({ commit, dispatch }) {		// Aktuellen Projektpfad aus den "store" laden
		commit('SET_PROJECT_PATH', { 'projectPath': store.get('projectPath', remote.app.getPath('userData')) })
		dispatch('LOAD_PARSER_FILE')
	},
	SET_PROJECT_PATH: function ({ commit, dispatch }) {		// Aktuellen Projektpfad neu setzen und in den "store" speichern
		store.set('projectPath', state.projectPath)
		dispatch('LOAD_PARSER_FILE')
	},
	DIALOG_PROJECT_PATH: function ({ commit, dispatch }) {		// Dialog zur auswahl einens neuen Projektpfads öffnen
		var newFolder = dialog.showOpenDialog({
			title: 'Projekt Verzeichniss auswählen',
			defaultPath: state.projectPath,
			properties: ['openDirectory']
		})
		if (!newFolder) return
		var folderState = fs.statSync(newFolder[0])
		if (folderState && folderState.isDirectory) {
			if (folderState.isDirectory()) {
				commit('SET_PROJECT_PATH', { 'projectPath': newFolder[0] })
				dispatch('LOAD_PARSER_FILE')
			} else {
				alert('Auswahl ist kein Verzeichniss!', 'Fehler!')
			}
		} else {
			alert('Fehler beim auswählen des Verzeichnisses!\n\n' + JSON.stringify(folderState), 'Fehler!')
		}
	},
}

export default {
	state,
	mutations,
	actions
}
