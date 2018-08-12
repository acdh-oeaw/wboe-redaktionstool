import Xml from '../Xml'
import Vue from 'vue'
import store from '@/store'

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
	addByParser: function (pos, pObj) {
		console.log('addByParser', this, pos, pObj)
		let aKey = pos
		if (aKey || aKey === 0) {
			this.childs.splice(aKey, 0, new Xml.XmlObject(this.root, [this, ...this.parents]))
		} else {
			aKey = this.childs.push(new Xml.XmlObject(this.root, [this, ...this.parents])) - 1
		}
		this.childs[aKey].type = ((pObj.name === '#text') ? 'TEXT' : 'ELEMENT')
		this.childs[aKey].name = pObj.name
		let pAttr = pObj.options.get('attributes')
		if (pAttr) {
			Object.keys(pAttr).forEach(function (attrKey) {
				let aAttr = pAttr[attrKey]
				if (aAttr.value) {
					this.childs[aKey].attributes[attrKey] = aAttr.value
				} else if ((!aAttr.canBeEmpty || !aAttr.canBeEmpty.use) && aAttr.possibleValues && aAttr.possibleValues[0]) {
					this.childs[aKey].attributes[attrKey] = aAttr.possibleValues[0]
				}
			}, this)
		}
		if (pObj.options.get('value.is.use') && pObj.options.get('value.is.value')) {
			this.childs[aKey].value = pObj.options.get('value.is.value')
		}
		this.childs[aKey].useable = true
		this.childs[aKey].ready = true
		this.childs[aKey].parserIgnore = false
		if (this.ready) {
			store.dispatch('IS_CHANGED')
		}
		return this.childs[aKey]
	},
	addAfterByParser: function (pObj) {
		if (this.parents.length > 0) {
			let aPos = this.siblings.indexOf(this) + 1
			return this.parents[0].addByParser(aPos, pObj)
		} else {
			console.log('Xml - Kann nicht hinzugefügt werden!', this)
		}
	},
	move: function (xObj, dir = true) {		// dir = true - Nach xObj verschieben
		console.log('move', this.siblings.indexOf(this) + ' ' + ((dir) ? 'after' : 'before') + ' ' + this.siblings.indexOf(xObj), this, xObj)
		let tPos = this.siblings.indexOf(this)
		let ePos = this.siblings.indexOf(xObj)
		if (tPos > -1 && ePos > -1) {
			this.siblings.splice(ePos, 0, this.siblings.splice(tPos, 1)[0])
			if (this.ready) {
				store.dispatch('IS_CHANGED')
			}
		} else {
			console.log('Fehler! Verschieben kann nicht funktionieren!')
		}
	},
	delete: function (direct = false) {
		if (this.siblings) {
			if (direct || confirm('Soll der Tag "' + this.name + '" wirklich gelöscht werden? (xml)')) {
				console.log('XML - Löschen: ' + this.name)
				this.childs.forEach(function (aChild) {		// Zuerst die Kinder löschen!
					aChild.delete(true)
				}, this)
				this.root.family[this.uId] = null
				this.siblings.some(function (aSib, aSibKey) {		// Aktuellen Key ermitteln und löschen!
					if (aSib === this) {
						Vue.delete(this.siblings, aSibKey)
						console.log('XmlObject gelöscht ...')
						if (this.ready) {
							store.dispatch('IS_CHANGED')
						}
						return true
					}
				}, this)
			}
		} else {
			console.log('XML - Kann nicht gelöscht werden!', this)
		}
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
		console.log('setValue', this, val)
		// ToDo: innerXML ?!?!
		if (this.type === 'TEXT') {
			if (this.value !== val) {
				this.value = val
				store.dispatch('IS_CHANGED')
			}
		} else {
			let aTxtChilds = this.getChildsOfType(['TEXT'], false, false)
			if (aTxtChilds.length === 1) {
				if (aTxtChilds[0].value !== val) {
					aTxtChilds[0].value = val
					store.dispatch('IS_CHANGED')
				}
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
				if (val) { store.dispatch('IS_CHANGED') }
			}
		}
		return this.getValue(false)
	},
	setAttribute: function (attr, val) {
		console.log('setAttribute', this, val)
		if (!this.attributes[attr] || this.attributes[attr] !== val) {
			Vue.set(this.attributes, attr, val)
			store.dispatch('IS_CHANGED')
		}
		return { 'attribute': attr, 'value': val }
	},
	getXML: function (all = true, lb = true, short = false, inner = false, deep = 0, prvXmlObj) {
		let aXML = ''
		if (this.type === 'TEXT') {
			if (prvXmlObj && (['COMMENT', 'PROCESSING_INSTRUCTION', 'UNKNOWN'].indexOf(prvXmlObj.type) > -1)) {
				aXML += '\n' + '	'.repeat(deep) + (this.value || '') + '\n' + '	'.repeat(deep - 1)
			} else {
				aXML += this.value || ''
			}
		} else if (this.type === 'COMMENT' && all) {
			aXML += '\n' + '	'.repeat(deep) + '<!-- ' + (this.value || '') + ' -->'
		} else if (this.type === 'PROCESSING_INSTRUCTION' && all) {
			aXML += '\n' + '	'.repeat(deep) + '<?' + (this.name || '') + ' ' + (this.value || '') + '?>'
		} else if (this.type === 'UNKNOWN' && all) {
			aXML += (this.value || '')
		} else if (this.type === 'ELEMENT') {
			let aChildCont = ''
			let lChild = null
			if (!inner) {
				aXML += '\n' + '	'.repeat(deep) + '<' + this.name
				if (Object.keys(this.attributes).length > 0) {
					Object.keys(this.attributes).forEach(function (aKey) {
						aXML += ' ' + aKey
						if (this.attributes[aKey]) {
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
