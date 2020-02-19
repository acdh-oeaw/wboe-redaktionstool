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
	SET_CONTENT: (state, { path, files, paths, open }) => {		// Werte für Verzeichnissstruktur setzen
		Vue.set(state.paths, path, {'paths': paths, 'files': files, 'isOpen': open})
	},
	UPDATE_CONTENT: (state, { path, files, paths, open }) => {		// Werte für Verzeichnissstruktur updaten
		// ToDo!
		Vue.set(state.paths[path], 'paths', paths)
		Vue.set(state.paths[path], 'files', files)
	},
	SET_PATHS_INFO: (state, { path, fileIndex, info, sInfo }) => {
		Vue.set(state.paths[path].files[fileIndex], 'info', info)
		Vue.set(state.paths[path].files[fileIndex], 'sInfo', sInfo)
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
	IS_CHANGED ({ commit }) {
		commit('SET_CHANGED', { 'bool': true })
	},
	NOT_CHANGED ({ commit }) {
		commit('SET_CHANGED', { 'bool': false })
	},
	TOGGLE_OPEN ({ commit, dispatch }, { path }) {		// Anzeige Pfad offen/geschlossen wechseln und ggf. Inhalt cachen
		if (!state.paths[path]) {
			dispatch('GET_PATH', { 'path': path })
		}
		commit('TOGGLE_PATH_OPEN', { 'path': path })
	},
	LOAD_FILE ({ commit, dispatch }, file = null) {
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
	SAVE_FILE ({ commit, dispatch }, content) {
		commit('SET_FILE', { 'file': state.file, 'content': content })
		try {
			fs.writeFileSync(state.file, content, 'utf8')
			dispatch('NOT_CHANGED')
		} catch (e) {
			console.log(e)
			alert('Beim speichern kam es zu einem Fehler!\nDatei NICHT gespeichert!')
		}
	},
	RELOAD_FILE ({ commit, dispatch }) {
		var aFile = state.file
		var fileContent = fs.readFileSync(aFile, 'utf8')
		commit('SET_FILE', { 'file': aFile, 'content': fileContent })
		dispatch('NOT_CHANGED')
	},
	UNSET_FILE ({ commit }) {
		commit('SET_FILE', { 'file': null, 'content': null })
	},
	NEW_FILE ({ commit, dispatch }, { filename, parser }) {
		console.log('NEW_FILE', filename)
		let aCont = ''
		let aXmlObj = new XmlObject.XmlBase()
		aXmlObj.ready = true
		aXmlObj.useable = true
		let aEditorObj = new EditorObject.EditorBase(parser, aXmlObj)
		console.log(aEditorObj)
		aCont = aEditorObj.getXML(aEditorObj)
		commit('SET_FILE', { 'file': filename, 'content': aCont })
		dispatch('SAVE_FILE', aCont)
	},
	CLEAN_PATH ({ commit }) {		// Cache für Verzeichnissstruktur löschen
		commit('CLEAN_CONTENT')
	},
	GET_PATH ({ commit, dispatch, rootState }, { path, update = false }) {		// Inhalt für das Verzeichniss "path" cachen
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
							'size': stats.size,
							'info': null,
							'sInfo': null
						})
					}
				}
			}
		}, this)
		files = files.slice().sort(lowerSort)
		paths = paths.slice().sort(lowerSort)
		commit(((update) ? 'UPDATE_CONTENT' : 'SET_CONTENT'), { 'path': path, 'files': files, 'paths': paths, 'open': (rootState.Options.projectPath === path) })
	},
	UPDATE_PATHS ({ commit, dispatch }) {		// Gecachte Inhalt für "Verzeichnisse" updaten
		Object.keys(state.paths).forEach(function (aDir) {
			dispatch('GET_PATH', { 'path': aDir, 'update': true })
		}, this)
	},
	UPDATE_PATHS_INFOS ({ commit }, { parser, check = false }) {
		if (!state.asyncPaths) {
			let t0 = performance.now()
			Object.keys(state.paths).forEach(function (aDir) {
				state.paths[aDir].files.forEach(function (aFile, aFileIndex) {
					if (aFile.ext === 'xml') {
						let editorFile = fs.readFileSync(aFile.fullFileName, 'utf8').replace(/\r/gmi, '')
						let pInfo = {
							'path': aDir,
							'fileIndex': aFileIndex,
							'info': null,
							'sInfo': null
						}
						let xmlObj = new XmlObject.XmlBase(editorFile)
						let aVersion = '?'
						let aStatus = '?'
						let aEditor = '?'
						if (xmlObj.orgDOM) {
							for (let i = 0; i < xmlObj.orgDOM.childNodes.length; i++) {
								let aObj = xmlObj.orgDOM.childNodes[i]
								if (aObj.nodeName === 'redaktionstool' && aObj.nodeValue.length > 3) {
									let aMatch = aObj.nodeValue.match(/version="([0-9.]+)"/)
									if (aMatch.length === 2) {
										aVersion = aMatch[1]
									}
								}
							}
							let aChangesXML = xmlObj.orgDOM.getElementsByTagName('change')
							let lDate = 0
							if (aChangesXML.length > 0) {
								for (let i = 0; i < aChangesXML.length; i++) {
									let aObj = aChangesXML[i]
									if (aObj.attributes['when']) {
										let aDate = aObj.attributes['when'].nodeValue
										aDate = parseInt(aDate.split('-').join(''))
										if (aDate >= lDate) {
											lDate = aDate
											aStatus = aObj.attributes['status'].nodeValue
										}
									}
								}
							}
							let aEditorXML = xmlObj.orgDOM.getElementsByTagName('respStmt')
							if (aEditorXML.length > 0) {
								aEditorXML = aEditorXML[0].childNodes
								if (aEditorXML.length > 0) {
									for (let i = 0; i < aEditorXML.length; i++) {
										if (aEditorXML[i].nodeName === 'name') {
											aEditor = aEditorXML[i].innerHTML
										}
									}
								}
							}
						}
						pInfo.sInfo = {
							'status': aStatus,
							'editor': aEditor,
							'version': aVersion
						}
						if (check) {
							let editorObj = new EditorObject.EditorBase(parser, new XmlObject.XmlBase(xmlObj))
							pInfo.info = {
								'errors': Object.keys(editorObj.errors).length,
								'warnings': Object.keys(editorObj.warnings).length,
								'comments': editorObj.comments.length,
								'commentsObj': editorObj.comments,
								'changed': (editorObj.getXML(editorObj) !== editorFile)
							}
						}
						commit('SET_PATHS_INFO', pInfo)
					}
				}, this)
			}, this)
			console.log('UPDATE_PATHS_INFOS', Math.ceil(performance.now() - t0) + ' ms.', state.paths)
			return true
		} else {
			console.log('UPDATE_PATHS_INFOS', 'Konnte nicht ausgeführt werden weil es bereits läuft!')
			return false
		}
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
