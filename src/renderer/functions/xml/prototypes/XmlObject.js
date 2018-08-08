// import xmlFunctions from '@/functions/XmlFunctions'
import Xml from '../Xml'
import Vue from 'vue'

const localFunctions = {
	init: function () {
		// Aktuelles DOM Objekt auswerten
		if (!(typeof this.uId === 'number') || this.root.family.indexOf[this.uId] === -1) {		// Die "uId" zuweisen falls noch nicht vorhanden
			this.uId = this.root.family.push(this) - 1
		}
		if (this.orgDOM) {
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
				// ToDo: Trim verbessern!
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
				this.value = this.orgDOM.nodeValue.trim()
			} else {
				this.type = 'UNKNOWN'
				this.name = this.orgDOM.nodeName
				this.value = this.orgDOM.outerHTML || this.orgDOM.nodeValue
				// this.addError('Unbekannter "nodeType": ' + this.orgDOM.nodeType + '!')
				return false
			}
		}
		return true
	},
	getValueByOption: function (parOptVal, asArray = true, flat = true) {
		if (parOptVal && parOptVal.innerXML && parOptVal.innerXML.use === true) {
			return this.getXML(false, false, false, true)		// 1. PROCESSING_INSTRUCTION, COMMENT, UNKNOWN | 2. Formatiert
		} else {
			return this.getValue(asArray, flat)
		}
	},
	getValue: function (asArray = true, flat = true) {
		let aValue = []
		if (this.type === 'TEXT') {
			aValue.push(this.value)
		} else if (typeof this.value === 'string') {
			aValue.push(this.value)
		} else if (this.childs.length > 0) {
			this.childs.forEach(function (aChild) {
				let aCSgetVal = aChild.getValue(true, flat)
				if (aCSgetVal.length > 0) {
					if (flat) {
						aValue = [...aValue, ...aCSgetVal]
					} else {
						aValue.push(aCSgetVal)
					}
				}
			}, this)
		}
		// console.log('>>>> aValue', aValue)
		if (asArray) {
			return aValue
		} else {
			return aValue.toString()
		}
	},
	setValue: function (val) {
		// ToDo: innerXML ?!?!
		if (this.type === 'TEXT') {
			this.value = val
		} else {
			let aTxtChilds = this.getChildsOfType(['TEXT'], false, false)
			if (aTxtChilds.length === 1) {
				aTxtChilds[0].value = val
			} else if (aTxtChilds.length > 1) {
				// ToDo: Mehrer Text Kinder ?!?
				console.log(aTxtChilds.length + ' TEXT Kind ...')
			} else {
				// ToDo: "TEXT" - NODE hinzufügen
				let nTxt = this.childs.push(new Xml.XmlObject(this.root, [this, ...this.parents])) - 1
				this.childs[nTxt].type = 'TEXT'
				this.childs[nTxt].name = '#text'
				this.childs[nTxt].value = val
				this.childs[nTxt].useable = true
				this.childs[nTxt].ready = true
				this.childs[nTxt].parserIgnore = false
			}
		}
		return this.getValue(false)
	},
	setAttribute: function (attr, val) {
		Vue.set(this.attributes, attr, val)
		return { 'attribute': attr, 'value': val }
	},
	getXML: function (all = true, lb = true, short = false, inner = false, deep = 0, prvXmlObj) {
		let aXML = ''
		if (this.type === 'TEXT') {
			if (prvXmlObj && (['COMMENT', 'PROCESSING_INSTRUCTION', 'UNKNOWN'].indexOf(prvXmlObj.type) > -1)) {
				aXML += '\n' + '	'.repeat(deep) + this.value + '\n' + '	'.repeat(deep - 1)
			} else {
				aXML += this.value
			}
		} else if (this.type === 'COMMENT' && all) {
			aXML += '\n' + '	'.repeat(deep) + '<!-- ' + this.value + ' -->'
		} else if (this.type === 'PROCESSING_INSTRUCTION' && all) {
			aXML += '\n' + '	'.repeat(deep) + '<?' + this.name + ' ' + this.value + '?>'
		} else if (this.type === 'UNKNOWN' && all) {
			aXML += this.value
		} else if (this.type === 'ELEMENT') {
			let aChildCont = ''
			let lChild = null
			if (!inner) {
				aXML += '\n' + '	'.repeat(deep) + '<' + this.name
				if (Object.keys(this.attributes).length > 0) {
					Object.keys(this.attributes).forEach(function (aKey) {
						aXML += ' ' + aKey
						if (this.attributes[aKey] !== undefined && this.attributes[aKey] !== null) {
							aXML += '="' + this.attributes[aKey] + '"'
						}
					}, this)
				}
				if (!short) { aXML += '>' }
				if (this.comments.length > 0) {
					this.comments.forEach(function (aComment) {
						aChildCont += '\n' + '	'.repeat(deep + 1) + '<?comment ' + aComment + '?>'
						lChild = { 'type': 'PROCESSING_INSTRUCTION' }
					}, this)
				}
			}
			if (this.childs.length > 0) {
				this.childs.forEach(function (aChild) {
					aChildCont += aChild.getXML(all, lb, short, false, deep + 1, lChild)
					lChild = aChild
				}, this)
			}
			if (!inner && short && aChildCont.length === 0) {
				aXML += '/>'
			} else {
				if (!inner && short && aChildCont.length > 0) { aXML += '>' }
				if (aChildCont.length > 0) {
					if (this.getChildsOfType(['ELEMENT', 'COMMENT'], false, false).length > 0) {
						aXML += aChildCont + '\n' + '	'.repeat(deep)
					} else {
						aXML += aChildCont
					}
				}
				if (!inner) {
					aXML += '</' + this.name + '>'
				}
			}
		}
		return aXML
	},
	getChildsOfType: function (types, ready = true, useable = true) {
		let aChilds = []
		if (this.childs.length > 0) {
			this.childs.forEach(function (aChild) {
				if ((aChild.ready || !ready) && (aChild.useable || !useable)
				&& types.indexOf(aChild.type) > -1) {
					aChilds.push(aChild)
				}
			}, this)
		}
		return aChilds
	},
	getChildsByName: function (name, ready = true, useable = true) {
		let aChilds = []
		if (this.childs.length > 0) {
			this.childs.forEach(function (aChild) {
				if ((aChild.ready || !ready) && (aChild.useable || !useable)
				&& aChild.name === name) {
					aChilds.push(aChild)
				}
			}, this)
		}
		return aChilds
	},
}

export default localFunctions
