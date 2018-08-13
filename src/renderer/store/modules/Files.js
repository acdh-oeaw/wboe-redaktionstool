import EditorObject from '@/functions/editor/Editor'
import XmlObject from '@/functions/xml/Xml'
import Vue from 'vue'
import { remote } from 'electron'
import fPath from 'path'
const fs = remote.require('fs')

const state = {
	paths: {},		// Cach für Verzeichnissstruktur
	file: null,
	fileContent: null,
	changed: false,
}

const mutations = {
	CLEAN_CONTENT: (state) => {		// Cache für Verzeichnissstruktur löschen
		state.paths = {}
	},
	SET_CONTENT: (state, { path, files, paths }) => {		// Werte für Verzeichnissstruktur setzen
		Vue.set(state.paths, path, {'paths': paths, 'files': files, 'isOpen': false})
	},
	UPDATE_CONTENT: (state, { path, files, paths }) => {		// Werte für Verzeichnissstruktur updaten
		// ToDo!
		Vue.set(state.paths[path], 'paths', paths)
		Vue.set(state.paths[path], 'files', files)
	},
	TOGGLE_PATH_OPEN: (state, { path }) => {		// Anzeige Pfad offen/geschlossen wechseln
		state.paths[path].isOpen = !state.paths[path].isOpen
	},
	SET_FILE: (state, { file, content }) => {		// Aktuelle Datei laden
		state.file = file
		state.fileContent = content
	},
	SET_CHANGED: (state, { bool }) => {		// Anzeige Pfad offen/geschlossen wechseln
		state.changed = bool
	},
}

const actions = {
	IS_CHANGED: function ({ commit }) {
		commit('SET_CHANGED', { 'bool': true })
	},
	NOT_CHANGED: function ({ commit }) {
		commit('SET_CHANGED', { 'bool': false })
	},
	TOGGLE_OPEN: function ({ commit, dispatch }, { path }) {		// Anzeige Pfad offen/geschlossen wechseln und ggf. Inhalt cachen
		if (!state.paths[path]) {
			dispatch('GET_PATH', { 'path': path })
		}
		commit('TOGGLE_PATH_OPEN', { 'path': path })
	},
	LOAD_FILE: function ({ commit, dispatch }, file = null) {
		try {
			commit('SET_FILE', { 'file': file, 'content': fs.readFileSync(file, 'utf8') })
			dispatch('SET_LASTFILE', file)
			dispatch('NOT_CHANGED')
		} catch (e) {
			console.log(e)
			commit('SET_FILE', { 'file': null, 'content': null })
			alert('Konnte Datei "' + file + '" nicht laden!')
		}
	},
	SAVE_FILE: function ({ commit, dispatch }, content) {
		commit('SET_FILE', { 'file': state.file, 'content': content })
		try {
			fs.writeFileSync(state.file, content, 'utf8')
			dispatch('NOT_CHANGED')
		} catch (e) {
			console.log(e)
			alert('Beim speichern kam es zu einem Fehler!\nDatei NICHT gespeichert!')
		}
	},
	RELOAD_FILE: function ({ commit, dispatch }) {
		var aFile = state.file
		var fileContent = fs.readFileSync(aFile, 'utf8')
		commit('SET_FILE', { 'file': aFile, 'content': fileContent })
		dispatch('NOT_CHANGED')
	},
	UNSET_FILE: function ({ commit }) {
		commit('SET_FILE', { 'file': null, 'content': null })
	},
	NEW_FILE: function ({ commit, dispatch }, { filename, parser }) {
		console.log('NEW_FILE', filename)
		let aCont = ''
		let aXmlObj = new XmlObject.XmlBase()
		aXmlObj.ready = true
		aXmlObj.useable = true
		let aEditorObj = new EditorObject.EditorBase(parser, aXmlObj)
		console.log(aEditorObj)
		aCont = aEditorObj.getXML()
		commit('SET_FILE', { 'file': filename, 'content': aCont })
		dispatch('SAVE_FILE', aCont)
	},
	CLEAN_PATH: function ({ commit }) {		// Cache für Verzeichnissstruktur löschen
		commit('CLEAN_CONTENT')
	},
	GET_PATH: function ({ commit }, { path, update = false }) {		// Inhalt für das Verzeichniss "path" cachen
		console.log('GET_PATH:', ((update) ? 'Update - ' : 'Neu - '), path)
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
						'file': file,
						'fullFileName': aFullFileName,
						'isOpen': false,
						'size': stats.size
					})
				} else {
					let aExt = file.split('.').pop()
					if (aExt === 'xml') {
						files.push({
							'file': file,
							'ext': aExt,
							'fullFileName': aFullFileName,
							'path': path,
							'size': stats.size
						})
					}
				}
			}
		}, this)
		files = files.slice().sort(lowerSort)
		paths = paths.slice().sort(lowerSort)
		commit(((update) ? 'UPDATE_CONTENT' : 'SET_CONTENT'), { 'path': path, 'files': files, 'paths': paths })
	},
	UPDATE_PATHS: function ({ commit, dispatch }) {		// Gecachte Inhalt für "Verzeichnisse" updaten
		Object.keys(state.paths).forEach(function (aDir) {
			dispatch('GET_PATH', { 'path': aDir, 'update': true })
		}, this)
	},
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
