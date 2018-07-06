import { remote } from 'electron'
const fs = remote.require('fs')
const { dialog } = remote
const Store = require('electron-store')
const store = new Store()

const state = {
	projectPath: undefined
}

const mutations = {
	SET_PROJECT_PATH: (state, { projectPath }) => {
		state.projectPath = projectPath
	}
}

const actions = {
	GET_PROJECT_PATH: function ({ commit }) {
		commit('SET_PROJECT_PATH', { projectPath: store.get('projectPath', remote.app.getPath('userData')) })
	},
	SET_PROJECT_PATH: function ({ commit }) {
		store.set('projectPath', state.projectPath)
	},
	DIALOG_PROJECT_PATH: function ({ commit }) {
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
			} else {
				alert('Auswahl ist kein Verzeichniss!', 'Fehler!')
			}
		} else {
			alert('Fehler beim auswählen des Verzeichnisses!\n\n' + JSON.stringify(folderState), 'Fehler!')
		}
	}
}

export default {
	state,
	mutations,
	actions
}
