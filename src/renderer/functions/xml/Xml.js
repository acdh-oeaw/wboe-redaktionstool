// import prototypeXmlMultible from './prototypes/XmlMultible'
// import prototypeXmlBase from './prototypes/XmlBase'
// import prototypeXmlObject from './prototypes/XmlObject'

const localFunctions = {
	XmlBase: function (xmlString) {
		this.ready = false						// Ist das Objekt bereit?
		this.useable = false					// Kann das Objekt zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = {}							// Fehler. Property = "XmlObject.uId" oder "-1" für "XmlBase"
		this.warnings = {}						// Warnungen. Property = "XmlObject.uId" oder "-1" für "XmlBase"
		this.content = []							// Enthaltene "XmlObject" Kinder
		this.family = []							// Alle "XmlObject"e "Key" = "uId"
		this.orgString = undefined		// Original String für DOM
		this.orgDOM = undefined				// Original DOM über init generiert
		// if (xmlString) {							// Wenn der "xmlString" übergeben wurde direkt initialisieren
		// 	this.init(xmlString)
		// }
	},
	XmlObject: function (root, parents, dom) {
		this.ready = false						// Ist das Objekt bereit?
		this.useable = false					// Kann das Objekt zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = []							// Liste der Fehler
		this.warnings = []						// Liste der Warnungen
		this.uId = undefined					// Individuelle Nummer des XmlObjects
		this.name = undefined					// Tagname
		this.value = undefined				// Inhalt des Tags falls Value
		this.attributes = {}					// Attribute des Tags
		this.childs = []							// Enthaltene "XmlObject" Kinder
		this.parents = parents || []	// Liste der Eltern
		this.root = root							// Enthält die "XmlBase"
		this.orgDOM = dom							// Original DOM
		this.siblings = ((this.parents.length > 0) ? this.parents[0].childs : this.root.content)		// Geschwister
		// this.init()										// Immer dirket initialisieren
	},
}

// XmlBase Prototypen
// localFunctions.XmlBase.prototype.addError = prototypeXmlMultible.addError
// localFunctions.XmlBase.prototype.init = prototypeXmlBase.init

// XmlObject Prototypen
// localFunctions.XmlObject.prototype.addError = prototypeXmlMultible.addError
// localFunctions.XmlObject.prototype.init = prototypeXmlObject.init

export default localFunctions
