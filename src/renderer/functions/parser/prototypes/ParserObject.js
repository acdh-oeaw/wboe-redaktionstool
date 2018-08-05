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
						this.options.extendJSON(child.nodeValue, this)
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
				let aTextOptions = {}
				try {
					aTextOptions = JSON.parse(this.orgDOM.nodeValue)
				} catch (err) {
					console.log(err)
					let errArr = [err.toString()]
					let errRange = errArr[0].match(/position (\d+)/mi)
					if (errRange.length > 1) {
						errArr.push('Fehlerbereich: ' + ((errRange[1] > 20) ? '...' : '') + this.orgDOM.nodeValue.substr(((errRange[1] > 20) ? errRange[1] - 20 : 0), 40).trim() + '...')
					}
					this.addError({'txt': 'Fehler im JSON-String! (text)', 'err': errArr})
				}
				if (aTextOptions.options) {
					this.options.extendJSON(JSON.stringify(aTextOptions.options), this)
				}
				if (this.options.get('id')) {
					let aIid = this.options.get('id')
					if (!this.root.idList[aIid]) {
						this.root.idList[aIid] = this
					} else {
						this.addError('Id "' + aIid + '" doppelt vorhanden! (t)')
					}
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
			let aCopyOptions = undefined
			try {
				aCopyOptions = JSON.parse(this.orgDOM.nodeValue)
			} catch (err) {
				console.log(err)
				let errArr = [err.toString()]
				let errRange = errArr[0].match(/position (\d+)/mi)
				if (errRange.length > 1) {
					errArr.push('Fehlerbereich: ' + ((errRange[1] > 20) ? '...' : '') + this.orgDOM.nodeValue.substr(((errRange[1] > 20) ? errRange[1] - 20 : 0), 40).trim() + '...')
				}
				this.addError({'txt': 'Fehler im JSON-String! (copy)', 'err': errArr})
			}
			if (aCopyOptions) {
				if (this.root.idList[aCopyOptions.fromId]) {
					this.name = this.root.idList[aCopyOptions.fromId].name
					this.attributes = this.root.idList[aCopyOptions.fromId].attributes
					this.childs = this.root.idList[aCopyOptions.fromId].childs
					this.options.extendJSON(JSON.stringify(this.root.idList[aCopyOptions.fromId].options.options), this)
					if (aCopyOptions.options) {
						this.options.extendJSON(JSON.stringify(aCopyOptions.options), this)
					}
					this.ready = true
					this.useable = true
				} else {
					this.addError('Original Objekt mit ID "' + aCopyOptions.fromId + '" existiert nicht!')
				}
			}
		}
	},
	match: function (orgXmlObj, editorObj, checkChilds = true) {
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
			if (aCheckVal.warn.length > 0) {
				warnings.push(aCheckVal.warn)
			}
			if (aCheckVal.err.length > 0) {
				errors.push(aCheckVal.err)
			} else {
				score += 1 + ((aCheckVal.warn.length === 0) ? 0.1 : 0)
			}
			// Position prüfen
			aErr = this.checkPosition(orgXmlObj, editorObj)
			if (aErr.length > 0) {
				errors.push(aErr)
			} else {
				score += 1
			}
			// Kinder prüfen
			if (checkChilds) {
				if (ignoreChilds) {
					score += 1
				} else {
					aErr = this.checkChilds(orgXmlObj)
					if (aErr.length > 0) {
						errors.push(aErr)
					} else {
						score += 1
					}
				}
			}
		} else {
			errors.push({'err': 'Tag Name stimmt nicht überein!'})
			possible = false
		}
		return {'score': score, 'errors': errors, 'warnings': warnings, 'possible': possible, 'ignoreChilds': ignoreChilds}
	},
	getSiblings: function (mode = 'all', useable = false, inclSelf = false) {
		let rObj = []
		let hit = false
		if (this.siblings.length > 0) {
			this.siblings.some(function (aObj) {
				if (aObj === this) {
					hit = true
				}
				if ((!useable || aObj.useable)		// Nur "useable", falls vorhanden
				&& ((!hit && (mode === 'all' || mode === 'prev'))	// Nur vorherige
					|| (hit && (mode === 'all' || mode === 'next')))		// Nur nachfolgende
				&& (inclSelf || aObj !== this)) {		// Auch dieses Objekt
					rObj.push(aObj)
				}
			}, this)
		}
		if (mode === 'prev') { rObj.reverse() }
		return rObj
	},
	getChilds: function (mode = 'all', useable = false, inclAChild = false) {
		let rObj = []
		let hit = false
		if (this.childs.length > 0) {
			this.childs.some(function (aObj) {
				if (aObj === this) {
					hit = true
				}
				if ((!useable || aObj.useable)		// Nur "useable", falls vorhanden
				&& ((!hit && (mode === 'all' || mode === 'prev'))	// Nur vorherige
					|| (hit && (mode === 'all' || mode === 'next')))		// Nur nachfolgende
				&& (inclAChild || aObj !== this)) {		// Auch dieses Objekt
					rObj.push(aObj)
				}
			}, this)
		}
		if (mode === 'prev') { rObj.reverse() }
		return rObj
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
