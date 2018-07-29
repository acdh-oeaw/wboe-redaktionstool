// import xmlFunctions from '@/functions/XmlFunctions'
import Parser from '../Parser'

const localFunctions = {
	init: function () {
		// Aktuelles DOM Objekt auswerten
		if (!(typeof this.uId === 'number') || this.root.family.indexOf[this.uId] === -1) {		// Die "uId" zuweisen falls noch nicht vorhanden
			this.uId = this.root.family.push(this)
		}
		if (this.orgDOM.nodeType === this.orgDOM.ELEMENT_NODE) {		// Handelt es sich um ein Element
			this.name = this.orgDOM.nodeName		// Tag Namen setzen
			if (this.orgDOM.childNodes.length > 0) {		// Kinder auswerten falls nicht vorhanden
				this.orgDOM.childNodes.forEach(function (child) {
					if (child.nodeType === child.ELEMENT_NODE
					|| (child.nodeType === child.PROCESSING_INSTRUCTION_NODE && child.nodeName === 'copy')) {
						this.childs.push(new Parser.ParserObject(this.root, [this, ...this.parents], child))
					}
				}, this)
			}
			if (this.errors.length === 0) {
				this.useable = true
			}
			this.ready = true
		} else if (this.orgDOM.nodeType === this.orgDOM.PROCESSING_INSTRUCTION_NODE) {
			if (this.orgDOM.nodeName === 'copy') {		// Kopie vorbereiten
				this.isCopy = true
			} else {
				this.addError('Unbekannte "Processing Instruction": ' + this.orgDOM.nodeName + '!')
				return false
			}
		} else {
			this.addError('Unbekannter "nodeType": ' + this.orgDOM.nodeType + '!')
			return false
		}
		return true
	},
}

export default localFunctions
