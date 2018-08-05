import ParserObject from '@/functions/parser/Parser'
import { remote } from 'electron'
import fPath from 'path'
const fs = remote.require('fs')

const state = {
	file: undefined,
	parser: undefined
}

const mutations = {
	SET_PARSER_FILE: (state, { file, content, parser }) => {		// Aktuelle Datei laden
		state.file = file
		state.parser = parser
	},
}

const actions = {
	LOAD_PARSER_FILE: function ({ commit, dispatch }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
		var aFile = undefined		// fPath.join(state.projectPath, '/parser.xml')
		let fileContent = undefined
		var aParser = undefined
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
		console.log('GET_PARSER_FILE', aFile)
		commit('SET_PARSER_FILE', { file: aFile, content: fileContent, parser: aParser })
	},
	RELOAD_PARSER_FILE: function ({ commit, dispatch }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
		var aFile = state.file
		var fileContent = fs.readFileSync(aFile, 'utf8')
		var aParser = undefined
		if (fileContent) {
			aParser = new ParserObject.ParserBase(fileContent)
		}
		commit('SET_PARSER_FILE', { file: aFile, content: fileContent, parser: aParser })
	},
}

export default {
	state,
	mutations,
	actions
}
