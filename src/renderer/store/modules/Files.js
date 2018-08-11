import Vue from 'vue'
import { remote } from 'electron'
import fPath from 'path'
const fs = remote.require('fs')

const state = {
	paths: {},		// Cach für Verzeichnissstruktur
	file: null,
	fileContent: null
}

const mutations = {
	CLEAN_CONTENT: (state) => {		// Cache für Verzeichnissstruktur löschen
		state.paths = {}
	},
	SET_CONTENT: (state, { path, files, paths }) => {		// Werte für Verzeichnissstruktur setzen
		Vue.set(state.paths, path, {paths: paths, files: files})
	},
	TOGGLE_PATH_OPEN: (state, { path, fileKey }) => {		// Anzeige Pfad offen/geschlossen wechseln
		state.paths[path].paths[fileKey].isOpen = !state.paths[path].paths[fileKey].isOpen
	},
	SET_FILE: (state, { file, content }) => {		// Aktuelle Datei laden
		state.file = file
		state.fileContent = content
	},
}

const actions = {
	// ToDo: UPDATE_PATHS
	TOGGLE_OPEN: function ({ commit, dispatch }, {path, fileKey}) {		// Anzeige Pfad offen/geschlossen wechseln und ggf. Inhalt cachen
		if (state.paths[path] && state.paths[path].paths && state.paths[path].paths[fileKey]) {
			commit('TOGGLE_PATH_OPEN', { path: path, fileKey: fileKey })
			if (!state.paths[path].paths[fileKey].isOpen && state.paths[state.paths[path].paths[fileKey].fullFileName]) {
				dispatch('GET_PATH', state.paths[path].paths[fileKey].fullFileName)
			}
		}
	},
	LOAD_FILE: function ({ commit, dispatch }, file = null) {
		try {
			commit('SET_FILE', { 'file': file, 'content': fs.readFileSync(file, 'utf8') })
		} catch (e) {
			console.log(e)
			commit('SET_FILE', { 'file': null, 'content': null })
			alert('Konnte Datei "' + file + '" nicht laden!')
		}
	},
	RELOAD_FILE: function ({ commit, dispatch }) {
		var aFile = state.file
		var fileContent = fs.readFileSync(aFile, 'utf8')
		commit('SET_FILE', { file: aFile, content: fileContent })
	},
	CLEAN_PATH: function ({ commit }) {		// Cache für Verzeichnissstruktur löschen
		commit('CLEAN_CONTENT')
	},
	GET_PATH: function ({ commit }, path) {		// Inhalt für das Verzeichniss "path" cachen
		console.log('GET_PATH', path)
		let files = []
		let paths = []
		try {
			var aPathRead = fs.readdirSync(path)
		} catch (e) {
			aPathRead = []
			console.log(e)
		}
		aPathRead.forEach(function (file) {		// Verzeichniss Inhalt auswerten
			var aFullFileName = fPath.join(path, file)
			try {
				var stats = fs.statSync(aFullFileName)
			} catch (e) {
				stats = null
				console.log(e)
			}
			if (stats) {
				if (stats.isDirectory()) {
					paths.push({
						file: file,
						fullFileName: aFullFileName,
						isOpen: false,
						size: stats.size
					})
				} else {
					let aExt = file.split('.').pop()
					if (aExt === 'xml') {
						files.push({
							file: file,
							ext: aExt,
							fullFileName: aFullFileName,
							size: stats.size
						})
					}
				}
			}
		}, this)
		files = files.slice().sort(lowerSort)
		paths = paths.slice().sort(lowerSort)
		commit('SET_CONTENT', { path: path, files: files, paths: paths })
	}
}

function lowerSort (a, b) {
	if (a.file.toLowerCase() > b.file.toLowerCase()) { return 1 }
	if (a.file.toLowerCase() < b.file.toLowerCase()) { return -1 }
	return 0
}

export default {
	state,
	mutations,
	actions
}
