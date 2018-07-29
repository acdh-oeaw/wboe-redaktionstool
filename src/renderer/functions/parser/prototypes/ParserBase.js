import xmlFunctions from '@/functions/XmlFunctions'

const localFunctions = {
	addError: function (error) {
		var aNr = -1
		if (this.nr || this.nr === 0) {		// Handelt es sich um ein "ParserObject"?
			aNr = this.nr
		}
		if (!Array.isArray(this.errors[aNr])) {
			this.errors[aNr] = []
		}
		this.errors[aNr].push({'obj': this, 'err': error})
	},

	init: function (xmlString) {
		// "xmlString" überprüfen und auf "this.orgString" setzen
		if (typeof xmlString !== 'string') {		// Prüfen ob der übergebene Wert ein String ist
			this.orgString = undefined
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
		return true
	},
}

export default localFunctions
