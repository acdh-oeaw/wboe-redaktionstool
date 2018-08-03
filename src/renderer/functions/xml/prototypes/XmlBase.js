import xmlFunctions from '@/functions/XmlFunctions'
import Xml from '../Xml'

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
		// "this.orgDOM" verarbeiten und in "XmlObject"e umwandeln
		if (this.orgDOM.nodeType !== this.orgDOM.DOCUMENT_NODE) {
			this.addError('"nodeType" ist ' + this.orgDOM.nodeType + ' allerdings wurde ' + this.orgDOM.DOCUMENT_NODE + ' erwartet!')
			return false
		}
		if (this.orgDOM.childNodes.length > 0) {
			this.orgDOM.childNodes.forEach(function (topChild) {
				if (topChild.nodeType !== topChild.PROCESSING_INSTRUCTION_NODE) {
					this.content.push(new Xml.XmlObject(this, null, topChild))
				}
			}, this)
		}
		if (this.content.length === 0) {
			this.addError('Es wurde kein "objXmlContent" gefunden!')
			return false
		}
		this.ready = true
		if (Object.keys(this.errors).length > 0) {
			return false
		}
		this.useable = true
		return true
	},
	getXML: function () {
		let aXML = ''
		this.content.forEach(function (aCont) {
			aXML += aCont.getXML()
		}, this)
		return aXML
	}
}

export default localFunctions
