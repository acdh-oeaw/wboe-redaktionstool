import prototypeParserMultible from './prototypes/ParserMultible'
import prototypeParserBase from './prototypes/ParserBase'
import prototypeParserObject from './prototypes/ParserObject'
import prototypeParserOptions from './prototypes/ParserOptions'

const localFunctions = {
	ParserBase: function (xmlString) {
		this.ready = false						// Ist das Objekt bereit?
		this.useable = false					// Kann das Objekt zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = {}							// Fehler. Property = "ParserObject.uId" oder "-1" für "ParserBase"
		this.warnings = {}						// Warnungen. Property = "ParserObject.uId" oder "-1" für "ParserBase"
		this.content = []							// Enthaltene "ParserObject" Kinder
		this.system = []							// Enthaltene "ParserObject" Kinder
		this.header = undefined				// Wird als String bei der ausgegebenen XML-Datei eingefügt
		this.family = []							// Alle "ParserObject"e "Key" = "uId"
		this.idList = {}							// Alle "ParserObject"e mit "id". Property = "id"
		this.orgString = undefined		// Original String für DOM
		this.orgDOM = undefined				// Original DOM über init generiert
		if (xmlString) {							// Wenn der "xmlString" übergeben wurde direkt initialisieren
			this.init(xmlString)
		}
	},
	ParserObject: function (root, parents, dom) {
		this.ready = false						// Ist das Objekt bereit?
		this.useable = false					// Kann das Objekt zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = []							// Liste der Fehler
		this.warnings = []						// Liste der Warnungen
		this.uId = undefined					// Individuelle Nummer des ParserObjects
		this.name = undefined					// Tagname
		this.childs = []							// Enthaltene "ParserObject" Kinder
		this.parents = parents || []	// Liste der Eltern
		this.root = root							// Enthält die "ParserBase"
		this.options = new localFunctions.ParserOptions()	// Aktuelle Optionen als "ParserOptions"
		this.orgDOM = dom							// Original DOM
		this.isCopy = false						// Hanelt es sich um eine Kopie?
		this.siblings = ((this.parents.length > 0) ? this.parents[0].childs : this.root.content)		// Geschwister
		this.init()										// Immer dirket initialisieren
	},
	ParserOptions: function () {
		this.ready = false						// Ist die Option bereit?
		this.useable = false					// Kann die Option zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = []							// Liste der Fehler
		this.warnings = []						// Liste der Warnungen
		this.options = {}							// Aktuelle Optionen
		this.init()										// Immer dirket initialisieren
		// this.extendJSON(jsonString)		// Optionen erweitern durch JSON String
		// this.extendObj(optionObj)			// Optionen erweitern durch Objekt
		// this.get('x', 'y', ...)				// Option nach Pfad ermitteln x -> y -> ...
	},
}

// ParserBase Prototypen
localFunctions.ParserBase.prototype.addError = prototypeParserMultible.addError
localFunctions.ParserBase.prototype.init = prototypeParserBase.init

// ParserObject Prototypen
localFunctions.ParserObject.prototype.addError = prototypeParserMultible.addError
localFunctions.ParserObject.prototype.init = prototypeParserObject.init

// ParserOptions Prototypen
localFunctions.ParserOptions.prototype.addError = prototypeParserMultible.addError
localFunctions.ParserOptions.prototype.init = prototypeParserOptions.init

export default localFunctions
