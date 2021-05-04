import EditorObject from '@/functions/editor/Editor'
import XmlObject from '@/functions/xml/Xml'
import { remote } from 'electron'
const fs = remote.require('fs')

const state = {
	paths: {},		// Cache für Verzeichnissstruktur
	file: null,
	fileContent: null,
	changed: false,
}

const mutations = {
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
}

export default {
	state,
	mutations,
	actions
}
