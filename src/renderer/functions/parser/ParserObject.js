import prototypeParserBase from './prototypes/ParserBase'

const localFunctions = {
	ParserBase: function () {
		this.ready = false						// Ist das Objekt bereit?
		this.useable = false					// Kann das Objekt zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = {}							// Fehler. Property = "ParserObject.nr" oder "-1" für "ParserBase"
		this.content = []							// Enthaltene "ParserObject" Kinder
		this.system = []							// Enthaltene "ParserObject" Kinder
		this.header = undefined				// Wird als String bei der ausgegebenen XML-Datei eingefügt
		this.family = []							// Alle "ParserObject"e "Key" = "nr"
		this.idList = {}							// Alle "ParserObject"e mit "id". Property = "id"
		this.orgString = undefined		// Original String über init(xmlString) geladen
		this.orgDOM = undefined				// Original DOM über init generiert
	}
}

// ParserBase Prototypen
localFunctions.ParserBase.prototype.addError = prototypeParserBase.addError
localFunctions.ParserBase.prototype.init = prototypeParserBase.init

// ParserObject Prototypen

export default localFunctions
