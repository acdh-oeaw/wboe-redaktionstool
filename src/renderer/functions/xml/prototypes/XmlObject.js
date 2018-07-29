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
				// Optionen auswerten
				this.orgDOM.childNodes.forEach(function (child) {
					if (child.nodeType === child.PROCESSING_INSTRUCTION_NODE && child.nodeName === 'comment') {
						this.comment.push(child.nodeValue)
					}
				}, this)
				// Kinder auswerten
				this.orgDOM.childNodes.forEach(function (child) {
					if (!(child.nodeType === child.PROCESSING_INSTRUCTION_NODE && child.nodeName === 'comment')) {
						this.childs.push(new Xml.XmlObject(this.root, [this, ...this.parents], child))
					}
				}, this)
			}
			if (this.errors.length === 0) {
				this.useable = true
			}
			this.ready = true
			this.parserIgnore = false
		} else if (this.orgDOM.nodeType === this.orgDOM.PROCESSING_INSTRUCTION_NODE) {
			this.type = 'PROCESSING_INSTRUCTION'
		} else {
			this.type = 'UNKNOWN'
			this.addError('Unbekannter "nodeType": ' + this.orgDOM.nodeType + '!')
			return false
		}
		return true
	},
}

export default localFunctions
