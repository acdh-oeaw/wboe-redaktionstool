import xmlFunctions from '@/functions/XmlFunctions'
import Parser from '../Parser'

const localFunctions = {
	init: function (xmlString) {
		// "xmlString" überprüfen und auf "this.orgString" setzen
		if (typeof xmlString !== 'string') {		// Prüfen ob der übergebene Wert ein String ist
			this.addError('init() - Übergebener Wert ist kein "string"!')
			return false
		} else if (xmlString.trim().length < 20) {
			this.orgString = undefined
			this.addError('init() - Übergebener Wert ist viel zu klein!')
			return false
		}
		this.orgString = xmlString.trim()
		// "this.orgString" in DOM Objekt umwanden, überprüfen und in "this.orgDOM" setzen
		this.orgDOM = new DOMParser().parseFromString(this.orgString, 'application/xml')
		var xmlStringError = xmlFunctions.xmlDomCheck(this.orgDOM)		// Prüfen ob es Fehler gab
		if (xmlStringError.length > 0) {
			this.orgDOM = undefined
			this.addError({'txt': 'Beim verarbeiten der XML ist es zu einen Fehler gekommen!', 'sErr': xmlStringError})
			return false
		}
		// "this.orgDOM" verarbeiten und in "ParserObject"e umwandeln
		if (this.orgDOM.childNodes.length > 0) {
			this.orgDOM.childNodes.forEach(function (topChild) {
				if (topChild.nodeType === topChild.ELEMENT_NODE && topChild.nodeName === 'objParser') {
					if (topChild.childNodes.length > 0) {
						topChild.childNodes.forEach(function (parserChild) {
							if (parserChild.nodeType === parserChild.ELEMENT_NODE) {
								if (parserChild.nodeName === 'xmlParserHeader') {		// "this.header" setzen
									this.header = parserChild.textContent
								} else if (parserChild.nodeName === 'objParserContent') {		// "this.content" setzen
									if (parserChild.childNodes.length > 0) {
										parserChild.childNodes.forEach(function (contentChild) {
											if (contentChild.nodeType === contentChild.ELEMENT_NODE) {
												this.content.push(new Parser.ParserObject(this, null, contentChild))
											}
										}, this)
									}
								} else if (parserChild.nodeName === 'objParserSystem') {		// "this.system" setzen
									if (parserChild.childNodes.length > 0) {
										parserChild.childNodes.forEach(function (systemChild) {
											if (systemChild.nodeType === systemChild.ELEMENT_NODE) {
												this.system.push(new Parser.ParserObject(this, null, systemChild))
											}
										}, this)
									}
								}
							}
						}, this)
					}
				}
			}, this)
		}
		if (this.content.length === 0) {
			this.addError('Es wurde kein "objParserContent" gefunden!')
			return false
		}
		this.ready = true
		this.useable = true
		return true
	},
}

export default localFunctions
