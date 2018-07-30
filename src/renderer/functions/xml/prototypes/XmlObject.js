// import xmlFunctions from '@/functions/XmlFunctions'
import Xml from '../Xml'

const localFunctions = {
	init: function () {
		// Aktuelles DOM Objekt auswerten
		if (!(typeof this.uId === 'number') || this.root.family.indexOf[this.uId] === -1) {		// Die "uId" zuweisen falls noch nicht vorhanden
			this.uId = this.root.family.push(this) - 1
		}
		if (this.orgDOM.nodeType === this.orgDOM.ELEMENT_NODE) {		// Handelt es sich um ein Element
			this.type = 'ELEMENT'
			this.name = this.orgDOM.nodeName		// Tag Namen setzen
			// Attribute auswerten
			if (this.orgDOM.attributes.length > 0) {
				for (var i = 0; i < this.orgDOM.attributes.length; i++) {
					this.attributes[this.orgDOM.attributes[i].nodeName] = this.orgDOM.attributes[i].nodeValue
				}
			}
			// Kinder auswerten
			if (this.orgDOM.childNodes.length > 0) {
				// Processing Instruction Nodes auswerten
				this.orgDOM.childNodes.forEach(function (child) {
					if (child.nodeType === child.PROCESSING_INSTRUCTION_NODE && child.nodeName === 'comment') {		// Kommentare
						this.comments.push(child.nodeValue)
					}
				}, this)
				// Kinder auswerten
				this.orgDOM.childNodes.forEach(function (child) {
					if (!(child.nodeType === child.PROCESSING_INSTRUCTION_NODE && child.nodeName === 'comment')
					&& !(child.nodeType === child.TEXT_NODE && child.nodeValue.trim().length < 1)) {		// Leere Text Felder ignorieren
						this.childs.push(new Xml.XmlObject(this.root, [this, ...this.parents], child))
					}
				}, this)
			}
			if (this.errors.length === 0) {
				this.useable = true
			}
			this.ready = true
			this.parserIgnore = false
		} else if (this.orgDOM.nodeType === this.orgDOM.TEXT_NODE) {		// Ist es ein Text
			this.type = 'TEXT'
			this.name = '#text'
			this.value = this.orgDOM.nodeValue.trim()
			this.useable = true
			this.ready = true
			this.parserIgnore = false
		} else if (this.orgDOM.nodeType === this.orgDOM.PROCESSING_INSTRUCTION_NODE) {		// Ist es eine Processing Instruction
			this.type = 'PROCESSING_INSTRUCTION'
			this.name = this.orgDOM.nodeName		// Processing Namen setzen
			this.value = this.orgDOM.nodeValue
		} else if (this.orgDOM.nodeType === this.orgDOM.COMMENT_NODE) {		// Ist es Kommentar
			this.type = 'COMMENT'
			this.name = '#comment'
			this.value = this.orgDOM.nodeValue
		} else {
			this.type = 'UNKNOWN'
			this.name = this.orgDOM.nodeName
			this.value = this.orgDOM.outerHTML || this.orgDOM.nodeValue
			// this.addError('Unbekannter "nodeType": ' + this.orgDOM.nodeType + '!')
			return false
		}
		return true
	},
}

export default localFunctions
