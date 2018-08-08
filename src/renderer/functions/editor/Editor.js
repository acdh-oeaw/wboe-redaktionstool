import prototypeMultible from '../aPrototypes/Multible'
import prototypeEditorBase from './prototypes/EditorBase'
import prototypeEditorObject from './prototypes/EditorObject'

const localFunctions = {
	EditorBase: function (parserObj, xmlObj) {
		this.ready = false						// Ist das Objekt bereit?
		this.useable = false					// Kann das Objekt zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = {}							// Fehler. Property = "EditorObject.uId" oder "-1" für "EditorBase"
		this.warnings = {}						// Warnungen. Property = "EditorObject.uId" oder "-1" für "EditorBase"
		this.contentObj = null				// Enthaltene "EditorObject"
		this.family = []							// Alle "EditorObject"e "Key" = "uId"
		this.parserObj = parserObj || null	// parserObj
		this.orgXmlObj = xmlObj || null			// Original von xmlObj
		this.init()										// Immer dirket initialisieren
		this.updateFamilyErrors()
	},
	EditorObject: function (root, parents, parser, xml, isRoot, ignoreChilds) {
		this.parserObj = parser || null		// Aktuelles Parser Objekt
		this.orgXmlObj	= xml || null	// Original Xml Objekt
		this.ready = false						// Ist das Objekt bereit?
		this.useable = false					// Kann das Objekt zum parsen verwendet werden? (Keine Fehler und Ready)
		this.errors = []							// Liste der Fehler
		this.warnings = []						// Liste der Warnungen
		this.childsWithErrors = false		// Gibt es Kinder mit Fehlern
		this.descendantsWithErrors = false		// Gibt es Nachfahren mit Fehlern
		this.uId = undefined					// Individuelle Nummer des EditorObjects
		this.childs = []							// Enthaltene "EditorObject" Kinder
		this.ignoreChilds = ignoreChilds || false		// Sollen die Kinder ignoriert werden?
		this.parserUsed = {}					// Wie oft wurde jeder Parser bereits verwendet? { [uId] : [EditorObject, ...] }
		this.parserMatches = []				// Die "match"es
		this.parents = parents || []	// Liste der Eltern
		this.root = root							// Enthält die "EditorBase"
		this.isRoot = isRoot || false
		this.siblings = ((this.parents.length > 0) ? this.parents[0].childs : [this])		// Geschwister
		this.addableAfter = []				// Welche Objekte können nach diesem hinzugefügt werden?
		this.init()										// Immer dirket initialisieren
		// this.add(parser, pos, xml)			// Kind hinzufügen (XML hinzufügen falls nicht vorhanden!)
		// this.delete(pos)						// Kind löschen (Rekursion beachten)	(XML entfernen!)
		// this.getSiblings(mode, useable)		// Alle Geschwister
	},
}

// EditorBase Prototypen
localFunctions.EditorBase.prototype.addError = prototypeMultible.addError
localFunctions.EditorBase.prototype.addWarning = prototypeMultible.addWarning
localFunctions.EditorBase.prototype.getCompressedBaseError = prototypeMultible.getCompressedBaseError
localFunctions.EditorBase.prototype.updateFamilyErrors = prototypeMultible.updateFamilyErrors
localFunctions.EditorBase.prototype.init = prototypeEditorBase.init
localFunctions.EditorBase.prototype.getXML = prototypeEditorBase.getXML

// EditorObject Prototypen
localFunctions.EditorObject.prototype.addError = prototypeMultible.addError
localFunctions.EditorObject.prototype.addWarning = prototypeMultible.addWarning
localFunctions.EditorObject.prototype.deleteErrors = prototypeMultible.deleteErrors
localFunctions.EditorObject.prototype.deleteWarnings = prototypeMultible.deleteWarnings
localFunctions.EditorObject.prototype.init = prototypeEditorObject.init
localFunctions.EditorObject.prototype.add = prototypeEditorObject.add
localFunctions.EditorObject.prototype.getSiblings = prototypeEditorObject.getSiblings
localFunctions.EditorObject.prototype.getChilds = prototypeEditorObject.getChilds
localFunctions.EditorObject.prototype.checkParser = prototypeEditorObject.checkParser
localFunctions.EditorObject.prototype.updateAddableAfter = prototypeEditorObject.updateAddableAfter
// localFunctions.EditorObject.prototype.delete = prototypeEditorObject.delete
// localFunctions.EditorObject.prototype.allPrevSiblings = prototypeEditorObject.allPrevSiblings
// localFunctions.EditorObject.prototype.allAfterSiblings = prototypeEditorObject.delete

export default localFunctions
