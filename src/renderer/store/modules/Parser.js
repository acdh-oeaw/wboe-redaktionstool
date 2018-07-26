// import Vue from 'vue'
import { remote } from 'electron'
import xmlFunctions from '@/functions/XmlFunctions'
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
		let fileContent = undefined
		try {
			fileContent = fs.readFileSync(aFile, 'utf8')
		} catch (e) {
			try {
				aFile = fPath.join(__static, '/parser3.xml')
				fileContent = fs.readFileSync(aFile, 'utf8')
			} catch (e) {
				console.log(e)
			}
		}
		console.log('GET_PARSER_FILE', aFile)
		commit('SET_PARSER_FILE', { file: aFile, content: fileContent })
		dispatch('MAKE_PARSER')
	},
	RELOAD_PARSER_FILE: function ({ commit, dispatch }) {		// Aktuellen Parser aus Projektpfad laden bzw. aus "__static"
		var aFile = state.file
		var fileContent = fs.readFileSync(aFile, 'utf8')
		commit('SET_PARSER_FILE', { file: aFile, content: fileContent })
		dispatch('MAKE_PARSER')
	},
	MAKE_PARSER: function ({ commit, dispatch }) {
		// XML-Datei in DOM umwandeln:
		var xmlDomObj = xmlFunctions.string2xmlDom(state.fileContent)
		if (xmlDomObj.xmlDom === undefined || xmlDomObj.errors) {
			commit('SET_PARSER', { 'parser': undefined })
		} else {
			// console.log(ParserFunctionsParser.xml2ParserObj(xmlDomObj.xmlDom))
			commit('SET_PARSER', { 'parser': ParserFunctionsParser.xml2ParserObj(xmlDomObj.xmlDom) })
		}
	}
}

export default {
	state,
	mutations,
	actions
}
