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
	hasToBeHere: function (orgEditorObj) {
		// ToDo!
		return true
	},
	match: function (orgXmlObj, checkChilds = true) {
		let errors = []
		let warnings = []
		let score = 0
		let possible = true
		let ignoreChilds = false
		if (this.name === orgXmlObj.name) {		// Stimmt der Name überein?
			let aErr
			score += 1
			// Attribute prüfen
			aErr = this.checkAttributes(orgXmlObj.attributes)
			if (aErr.length > 0) {
				errors.push(aErr)
			} else {
				score += 1
			}
			// Value prüfen
			let aCheckVal = this.checkValue(orgXmlObj)
			ignoreChilds = ignoreChilds || aCheckVal.ignoreChilds
			if (aCheckVal.err.length > 0) {
				errors.push(aCheckVal.err)
			} else {
				score += 1
			}
			// ToDo: Position prüfen
			// ToDo: Kinder prüfen
		} else {
			errors.push({'err': 'Tag Name stimmt nicht überein!'})
			possible = false
		}
		return {'score': score, 'errors': errors, 'warnings': warnings, 'possible': possible, 'ignoreChilds': ignoreChilds}
	},
	checkValue: function (xmlObj) {
		let errors = []
		let ignoreChilds = false		// ToDo!
		let aValOption = this.options.get('value')
		if (aValOption) {
			ignoreChilds = true
			console.log('>>>> checkValue', aValOption, xmlObj.getValueByOption(aValOption))
			console.log('>>>>>>> getChildsOfType', xmlObj.getChildsOfType(['text']))
		}
		return {'err': errors, 'ignoreChilds': ignoreChilds}
	},
	checkAttributes: function (attrObjX) {
		let errors = []
		let attrObj = ((Object.keys(attrObjX).length > 0) ? attrObjX : null)
		let aParAttrObj = this.options.get('attributes')
		aParAttrObj = ((aParAttrObj && Object.keys(aParAttrObj).length > 0) ? aParAttrObj : null)
		if (attrObj && aParAttrObj) {		// Attribute testen
			// Überprüfen ob Attribute fehlen
			Object.keys(aParAttrObj).some(function (aKey) {
				// ToDo: Eventuelle If-Abfrage verarbeiten
				if (!(aParAttrObj[aKey].canBeEmpty && aParAttrObj[aKey].canBeEmpty.use)
				&& !attrObj.hasOwnProperty(aKey)) {
					errors.push({'err': 'Attribut "' + aKey + '" fehlt!'})
				}
			}, this)
			// Vorhandene Attribute überprüfen
			Object.keys(attrObj).forEach(function (aKey) {
				let aErr = this.checkAttribute(aKey, attrObj[aKey])
				if (aErr) { errors.push(aErr) }
			}, this)
		} else if (attrObj && !aParAttrObj) {		// Keine Attribute
			errors.push({'err': 'Keine Attribute erwartet!'})
		} else if (!attrObj && aParAttrObj) {		// Überprüfen ob alle Attribute optional sind
			Object.keys(aParAttrObj).some(function (aKey) {
				// ToDo: Eventuelle If-Abfrage verarbeiten
				if (!(aParAttrObj[aKey].canBeEmpty && aParAttrObj[aKey].canBeEmpty.use)) {
					errors.push({'err': 'Attribute erwartet!'})
					return true
				}
			}, this)
		}
		return errors
	},
	checkAttribute: function (attr, val) {
		let aParAttrObj = this.options.get('attributes.' + attr)
		if (!aParAttrObj) {
			return 'Attribut "' + attr + '" nicht erwartet'
		}
		// ToDo: Eventuelle If-Abfrage verarbeiten
		if (aParAttrObj.type === 'fixed' && val !== aParAttrObj.value) {
			return 'Attribut "' + attr + '" hat nicht den erwateten Wert!'
		}
		if (!aParAttrObj.canBeEmpty && (val === undefined || val.length === 0)) {
			return 'Wert von Attribut "' + attr + '" darf nicht leer sein!'
		}
		if (aParAttrObj.type === 'variable') {
			if (aParAttrObj.possibleValues && aParAttrObj.possibleValues.use) {
				if (val && aParAttrObj.possibleValues.indexOf(val) < 0) {
					return 'Wert "' + val + '" von Attribut "' + attr + '" nicht in der Liste möglicher Werte!'
				}
			}
		}
	},
}

export default localFunctions
