import Vue from 'vue'
import { remote } from 'electron'
import xmlFunctions from '@/functions/XmlFunctions'
import FilesFunctionsObject from './functions/FilesFunctionsObject'
import fPath from 'path'
const fs = remote.require('fs')

const state = {
	paths: {},		// Cach für Verzeichnissstruktur
	file: undefined,
	fileContent: undefined,
	fileObject: undefined
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
		state.fileObject = undefined
	},
	SET_FILE_OBJECT: (state, { object }) => {		// Aktuelles Datei Objekt setzen und cachen
		state.fileObject = object
	},
}

const actions = {
	// ToDo: UPDATE_PATHS
	TOGGLE_OPEN: function ({ commit, dispatch }, {path, fileKey}) {		// Anzeige Pfad offen/geschlossen wechseln und ggf. Inhalt cachen
		if (state.paths[path] && state.paths[path].paths && state.paths[path].paths[fileKey]) {
			commit('TOGGLE_PATH_OPEN', { path: path, fileKey: fileKey })
			if (state.paths[path].paths[fileKey].isOpen && state.paths[state.paths[path].paths[fileKey].fullFileName] === undefined) {
				dispatch('GET_PATH', state.paths[path].paths[fileKey].fullFileName)
			}
		}
	},
	LOAD_FILE: function ({ commit, dispatch }, file = undefined) {
		var aFile = file
		let fileContent = undefined
		// ToDo: Datei laden!
		try {
			fileContent = fs.readFileSync(aFile, 'utf8')
		} catch (e) {
			try {
				aFile = fPath.join(__static, '/demo2.xml')
				fileContent = fs.readFileSync(aFile, 'utf8')
			} catch (e) {
				console.log(e)
			}
		}
		console.log('SET_FILE', aFile)
		commit('SET_FILE', { file: aFile, content: fileContent })
		dispatch('MAKE_FILE_OBJECT')
	},
	MAKE_FILE_OBJECT: function ({ commit, dispatch }) {
		// XML-Datei in DOM umwandeln:
		var xmlDomObj = xmlFunctions.string2xmlDom(state.fileContent)
		if (xmlDomObj.xmlDom === undefined || xmlDomObj.errors) {
			commit('SET_FILE_OBJECT', { 'object': undefined })
		} else {
			commit('SET_FILE_OBJECT', { 'object': FilesFunctionsObject.xml2Obj(xmlDomObj.xmlDom) })
		}
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
				stats = undefined
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
		files = files.slice().sort((a, b) => {
			if (a.file.toLowerCase() > b.file.toLowerCase()) { return 1 }
			if (a.file.toLowerCase() < b.file.toLowerCase()) { return -1 }
			return 0
		})
		paths = paths.slice().sort((a, b) => {
			if (a.file.toLowerCase() > b.file.toLowerCase()) { return 1 }
			if (a.file.toLowerCase() < b.file.toLowerCase()) { return -1 }
			return 0
		})
		commit('SET_CONTENT', { path: path, files: files, paths: paths })
	}
}

export default {
	state,
	mutations,
	actions
}
