// import xmlFunctions from '@/functions/XmlFunctions'
import Parser from '../Parser'

const localFunctions = {
	init: function () {
		// Aktuelles DOM Objekt auswerten
		if (!(typeof this.uId === 'number') || this.root.family.indexOf[this.uId] === -1) {		// Die "uId" zuweisen falls noch nicht vorhanden
			this.uId = this.root.family.push(this) - 1
		}
		if (this.orgDOM.nodeType === this.orgDOM.ELEMENT_NODE) {		// Handelt es sich um ein Element
			this.name = this.orgDOM.nodeName		// Tag Namen setzen
			// Attribute auswerten
			if (this.orgDOM.attributes.length > 0) {
				for (var i = 0; i < this.orgDOM.attributes.length; i++) {
					this.attributes[this.orgDOM.attributes[i].nodeName] = this.orgDOM.attributes[i].nodeValue
				}
			}
			this.options.initFromParserObject(this)
			// Kinder auswerten falls nicht vorhanden
			if (this.orgDOM.childNodes.length > 0) {
				// Optionen auswerten
				this.orgDOM.childNodes.forEach(function (child) {
					if (child.nodeType === child.PROCESSING_INSTRUCTION_NODE && child.nodeName === 'options') {
						this.options.extendJSON(child.nodeValue)
					}
				}, this)
				// Handelt es sich bei den Childs um einen "innerTest"?
				if (this.options.get('value.innerText')) {
					let iText = ''
					if (this.orgDOM.childNodes.length > 0) {
						iText = this.orgDOM.innerHTML.replace(/<\?[^?>]*\?>/g, '').trim()
					}
					this.options.extendObj({'value': {'is': {'value': iText, 'use': true}}})
				} else {
					// Kinder auswerten
					let aValue = null
					this.orgDOM.childNodes.forEach(function (child) {
						if (child.nodeType === child.ELEMENT_NODE
						|| (child.nodeType === child.PROCESSING_INSTRUCTION_NODE && (child.nodeName === 'copy' || child.nodeName === 'text'))) {
							this.childs.push(new Parser.ParserObject(this.root, [this, ...this.parents], child))
						} else if (child.nodeType === child.TEXT_NODE) {
							aValue = child.nodeValue
						}
					}, this)
					if (typeof aValue === 'string' && this.childs.length === 0 && aValue.trim().length > 0) {
						this.options.extendObj({'value': {'is': {'value': aValue.trim(), 'use': true}}})
					}
				}
			}
			if (this.options.get('id')) {
				let aIid = this.options.get('id')
				if (!this.root.idList[aIid]) {
					this.root.idList[aIid] = this
				} else {
					this.addError('Id "' + aIid + '" doppelt vorhanden!')
				}
			}
			if (this.errors.length === 0) {
				this.useable = true
			}
			this.ready = true
		} else if (this.orgDOM.nodeType === this.orgDOM.PROCESSING_INSTRUCTION_NODE) {
			if (this.orgDOM.nodeName === 'copy') {		// Kopie vorbereiten
				this.isCopy = true
			} else if (this.orgDOM.nodeName === 'text') {		// Textobjekt verarbeiten
				this.name = '#text'
				let aTextOptions = JSON.parse(this.orgDOM.nodeValue)
				if (aTextOptions.options) {
					this.options.extendJSON(JSON.stringify(aTextOptions.options))
				}
				if (this.errors.length === 0) {
					this.useable = true
				}
				this.ready = true
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
	makeCopy: function () {
		if (this.isCopy) {
			let aCopyOptions = JSON.parse(this.orgDOM.nodeValue)
			if (this.root.idList[aCopyOptions.fromId]) {
				this.name = this.root.idList[aCopyOptions.fromId].name
				this.attributes = this.root.idList[aCopyOptions.fromId].attributes
				this.childs = this.root.idList[aCopyOptions.fromId].childs
				this.options.extendJSON(JSON.stringify(this.root.idList[aCopyOptions.fromId].options.options))
				if (aCopyOptions.options) {
					this.options.extendJSON(JSON.stringify(aCopyOptions.options))
				}
				this.ready = true
				this.useable = true
			} else {
				this.addError('Original Objekt mit ID "' + aCopyOptions.fromId + '" existiert nicht!')
			}
		}
	},
}

export default localFunctions
