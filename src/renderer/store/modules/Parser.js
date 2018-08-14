import ParserObject from '@/functions/parser/Parser'
import { remote } from 'electron'
import fPath from 'path'
const fs = remote.require('fs')
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
	LOAD_PARSER_FILE: function ({ commit, dispatch, rootState }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
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
			aParser = new ParserObject.ParserBase(fileContent)
		}
		console.log('LOAD_PARSER_FILE', aFile)
		commit('SET_PARSER_FILE', { file: aFile, content: fileContent, parser: aParser })
	},
	RELOAD_PARSER_FILE: function ({ commit, dispatch }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
		var aFile = state.file
		var fileContent = fs.readFileSync(aFile, 'utf8')
		var aParser = null
		if (fileContent) {
			aParser = new ParserObject.ParserBase(fileContent)
		}
		commit('SET_PARSER_FILE', { file: aFile, content: fileContent, parser: aParser })
	},
	DIALOG_SAVE_PARSER: function ({ commit, dispatch, rootState }) {		// Dialog öffnen um aktuellen Parser zu speichern
		var saveFile = dialog.showSaveDialog({
			title: 'Parser Datei speichern',
			defaultPath: fPath.join(rootState.Options.projectPath, '/parser.xml')
		})
		if (saveFile) {
			try {
				fs.writeFileSync(saveFile, state.content, 'utf-8')
				dispatch('LOAD_PARSER_FILE')
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
