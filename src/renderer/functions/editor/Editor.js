import prototypeEditorMultible from './prototypes/EditorMultible'
// import prototypeEditorBase from './prototypes/EditorBase'
// import prototypeEditorObject from './prototypes/EditorObject'

const localFunctions = {
	EditorBase: function (parserObj, xmlObj) {
		this.ready = false						// Ist das Objekt bereit?
		this.useable = false					// Kann das Objekt zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = {}							// Fehler. Property = "EditorObject.uId" oder "-1" für "EditorBase"
		this.warnings = {}						// Warnungen. Property = "EditorObject.uId" oder "-1" für "EditorBase"
		this.content = []							// Enthaltene "EditorObject" Kinder
		this.system = []							// Enthaltene "EditorObject" Kinder
		this.header = undefined				// Wird als String bei der ausgegebenen XML-Datei eingefügt
		this.family = []							// Alle "EditorObject"e "Key" = "uId"
		this.parserObj = parserObj || null		// Original von parserObj
		this.xmlObj = xmlObj || null	// Original von xmlObj
		// 	this.init()										// Immer dirket initialisieren
	},
	EditorObject: function (root, parents) {
		this.parserObj = null					// Aktuelles Parser Objekt
		this.xmlObj	= null						// Aktuelles Xml Objekt
		this.ready = false						// Ist das Objekt bereit?
		this.useable = false					// Kann das Objekt zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = []							// Liste der Fehler
		this.warnings = []						// Liste der Warnungen
		this.uId = undefined					// Individuelle Nummer des EditorObjects
		this.childs = []							// Enthaltene "EditorObject" Kinder
		this.parents = parents || []	// Liste der Eltern
		this.root = root							// Enthält die "EditorBase"
		this.isCopy = false						// Hanelt es sich um eine Kopie?
		this.siblings = ((this.parents.length > 0) ? this.parents[0].childs : this.root.content)		// Geschwister
		// this.init()										// Immer dirket initialisieren
	},
}

// EditorBase Prototypen
localFunctions.EditorBase.prototype.addError = prototypeEditorMultible.addError
// localFunctions.EditorBase.prototype.init = prototypeEditorBase.init

// EditorObject Prototypen
localFunctions.EditorObject.prototype.addError = prototypeEditorMultible.addError
// localFunctions.EditorObject.prototype.init = prototypeEditorObject.init
// localFunctions.EditorObject.prototype.makeCopy = prototypeEditorObject.makeCopy

export default localFunctions
