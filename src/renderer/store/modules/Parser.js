// import Vue from 'vue'
import { remote } from 'electron'
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
		var xmlStringError = xmlDomCheck(xmlDom)
		if (xmlStringError.length > 0) {
			alert('Beim verarbeiten der XML ist es zu einen Fehler gekommen:\n\n' + xmlStringError)
			commit('SET_PARSER', { parser: undefined })
			return false
		}
		var header = ''
		var content = []
		var system = []
		var ids = {}
		function xml2Obj (xml) {
			var obj = {}
			var rObj = {'unused': true}
			// Kinder verarbeiten
			var childs = []
			var processes = []
			if (xml.childNodes.length > 0) {
				xml.childNodes.forEach(function (v) {
					var child = xml2Obj(v)
					if (child.unused !== true) {
						if (child.isProcess !== true) {
							childs.push(child.obj)
						} else {
							processes.push(child.process)
						}
					}
				})
			}
			// Node verarbeiten
			if (xml.nodeType === xml.ELEMENT_NODE) {		// Reguläres Element
				obj.n = xml.nodeName
				if (obj.n === 'xmlParserHeader') {		// Header auswerten
					header = xml.textContent
					return {'unused': true}
				}
				if (childs.length > 0) {
					obj.c = childs
				}
				// Content setzen
				if (obj.n === 'objParserContent') {
					if (obj.c && obj.c.length > 0) {
						content = obj.c
						return {'unused': true}
					}
				}
				// System setzen
				if (obj.n === 'objParserSystem') {
					if (obj.c && obj.c.length > 0) {
						system = obj.c
						return {'unused': true}
					}
				}
				// Default Processing setzen
				obj.p = {
									'options': {
										'tagAsTitle': true,
										'attributes': undefined
									}
								}
				// Attribute auswerten
				if (xml.attributes.length > 0) {
					obj.p.options.attributes = {}
					for (var i = 0; i < xml.attributes.length; i++) {
						obj.p.options.attributes[xml.attributes[i].nodeName] = {'value': xml.attributes[i].nodeValue, 'type': 'fixed'}
					}
				}
				obj.p.options = decompressProcessingOptions(obj.p.options)
				// Processing Instruction hinzufügen
				if (processes.length > 0) {
					processes.forEach(function (process) {
						if (process.n === 'options') {
							var aProcess = decompressProcessingOptions(process.p)
							console.log(aProcess)
						} else {
							// console.log('Unbekannte "Processing Instruction": ' + process.n)
						}
					})
					// obj.p = processes
				}
				// Processing Instruction verarbeiten!

				rObj = {'obj': obj}		// Sonstiges
			} else if (xml.nodeType === xml.PROCESSING_INSTRUCTION_NODE) {		// Processing Instruction Element
				if (xml.nodeName === 'copy') {
					// ToDo: COPY?!?
				} else {
					return {'isProcess': true, 'process': {'n': xml.nodeName, 'p': JSON.parse(xml.textContent)}}
				}
			}
			return rObj
		}
		var parserData = xml2Obj(xmlDom)
		console.log('parserData', parserData)
		console.log('header', header)
		console.log('content', content)
		console.log('system', system)
		console.log('ids', ids)
		commit('SET_PARSER', { parser: {'header': header, 'content': content, 'system': system, 'ids': ids} })
	}
}

export default {
	state,
	mutations,
	actions
}

function decompressProcessingOptions (options) {
	var deflat = JSON.parse(JSON.stringify(options))
	for (var key in deflat) {
		// title
		if (key === 'title' && typeof deflat[key] === 'string') {
			deflat[key] = {'value': deflat[key], 'type': 'fixed'}
		}
		// attributes
		if (key === 'attributes' && deflat[key] !== undefined) {
			if (typeof deflat[key] === 'string') {
				deflat[key] = {[deflat[key]]: {'type': 'variable'}}
			} else if (Array.isArray(deflat[key])) {
				let nObjValue = {}
				deflat[key].forEach(function (attr) {
					if (typeof attr === 'string') {
						nObjValue[deflat[key]] = {'type': 'variable'}
					} else if (typeof attr === 'object') {
						for (var attrKey in attr) {
							nObjValue[attrKey] = attr[attrKey]
						}
					}
				})
				deflat[key] = nObjValue
			}
		}
		// value
		if (key === 'value' && deflat[key] !== undefined) {
			if (typeof deflat[key] === 'string') {
				deflat[key] = {[deflat[key]]: {'use': true}}
			} else if (Array.isArray(deflat[key])) {
				let nObjValue = {}
				deflat[key].forEach(function (val) {
					if (typeof val === 'string') {
						nObjValue[val] = {'use': true}
					} else if (typeof val === 'object') {
						for (var valKey in val) {
							nObjValue[valKey] = val[valKey]
						}
					}
				})
				deflat[key] = nObjValue
			}
		}
		// layout
		if ((key === 'layout' && deflat[key] !== undefined)) {
			deflat[key] = checkLayout(deflat[key])
		}
		// editor > layout
		if (key === 'editor' && deflat[key] !== undefined && deflat[key].layout !== undefined) {
			deflat[key].layout = checkLayout(deflat[key].layout)
		}
		// html > layout
		if (key === 'html' && deflat[key] !== undefined && deflat[key].layout !== undefined) {
			deflat[key].layout = checkLayout(deflat[key].layout)
		}
	}
	// console.log('decompressProcessingOptions', JSON.parse(JSON.stringify(options)), JSON.parse(JSON.stringify(deflat)))
	return deflat
}
// Layout
function checkLayout (layout) {
	var deflat = JSON.parse(JSON.stringify(layout))
	//
	console.log('layout', JSON.parse(JSON.stringify(layout)), JSON.parse(JSON.stringify(deflat)))
	return deflat
}

function xmlDomCheck (xmlDom, error = false) {		// Eventuelle Fehlermeldung des DOM-Objekts ausgeben
	var txt = ''
	var x = xmlDom.childNodes
	for (var i = 0; i < x.length; i++) {
		var y = x[i]
		if (y.nodeType === y.TEXT_NODE) {
			if (error) {
				txt += y.nodeValue + '\n'
			}
		} else {
			if (y.childNodes[0] !== undefined) {
				txt += xmlDomCheck(y, error || y.nodeName === 'parsererror')
			}
		}
	}
	return txt
}
