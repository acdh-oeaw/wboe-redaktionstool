// import Vue from 'vue'
import { remote } from 'electron'
import ParserFunctions from './functions/ParserFunctions'
import ParserFunctionsParser from './functions/ParserFunctionsParser'
import fPath from 'path'
const fs = remote.require('fs')

const state = {
	file: undefined,
	fileContent: undefined,
	parser: undefined
}

const mutations = {
	SET_PARSER_FILE: (state, { file, content }) => {		// Aktuelle Datei laden
		state.file = file
		state.fileContent = content
		state.parser = undefined
	},
	SET_PARSER: (state, { parser }) => {		// Aktuellen Parser setzen und cachen
		state.parser = parser
	},
}

const actions = {
	LOAD_PARSER_FILE: function ({ commit, dispatch }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
		var aFile = undefined		// fPath.join(state.projectPath, '/parser.xml')
		let fileContents = undefined
		try {
			fileContents = fs.readFileSync(aFile, 'utf8')
		} catch (e) {
			try {
				aFile = fPath.join(__static, '/parser2.xml')
				fileContents = fs.readFileSync(aFile, 'utf8')
			} catch (e) {
				console.log(e)
			}
		}
		console.log('GET_PARSER_FILE', aFile)
		commit('SET_PARSER_FILE', { file: aFile, content: fileContents })
		dispatch('MAKE_PARSER')
	},
	MAKE_PARSER: function ({ commit, dispatch }) {
		// XML-Datei in DOM umwandeln:
		var xmlDom = new DOMParser().parseFromString(state.fileContent, 'application/xml')
		var xmlStringError = ParserFunctions.xmlDomCheck(xmlDom)
		if (xmlStringError.length > 0) {
			alert('Beim verarbeiten der XML ist es zu einen Fehler gekommen:\n\n' + xmlStringError)
			commit('SET_PARSER', { parser: undefined })
			return false
		}
		commit('SET_PARSER', { 'parser': ParserFunctionsParser.xml2ParserObj(xmlDom) })
	}
}

export default {
	state,
	mutations,
	actions
}
