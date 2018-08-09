import stdFunctions from '@/functions/stdFunctions'
// import xmlFunctions from '@/functions/XmlFunctions'
import Editor from '../Editor'

const localFunctions = {
	init: function () {
		if (!(typeof this.uId === 'number') || this.root.family.indexOf[this.uId] === -1) {		// Die "uId" zuweisen falls noch nicht vorhanden
			this.uId = this.root.family.push(this) - 1
		}
		let aParserChilds = stdFunctions.getValOfSubProp(this.parserObj, 'childs') || []
		let aXmlChilds = stdFunctions.getValOfSubProp(this.orgXmlObj, 'childs') || []
		if (this.isRoot) {
			aParserChilds = stdFunctions.getValOfSubProp(this.parserObj, 'content') || []
			aXmlChilds = stdFunctions.getValOfSubProp(this.orgXmlObj, 'content') || []
		}
		// Parser mit XML Objekt vergleichen
		if (!this.ignoreChilds) {
			// console.log('--- Finde Parser der zu XML Objekt passt! ---')
			aXmlChilds.forEach(function (aXmlObj) {
				let aParList = []
				let useParser = false
				let aErrors = []
				let aWarnings = []
				if (aXmlObj.ready && aXmlObj.useable) {
					if (aParserChilds.length > 0) {
						useParser = true
						aParserChilds.forEach(function (aParObjChild) {
							if (aParObjChild.ready && aParObjChild.useable) {
								aParList.push({'pObj': aParObjChild, 'match': aParObjChild.match(aXmlObj, this)})
							}
						}, this)
						aParList = aParList.slice().sort(pMatchSort)		// Sortieren: "possible" nach oben, Fehler nach unten, höherer Score nach oben)
						// console.log('aParList - "' + aParList[0].pObj.name + '":', aParList, this)
						if (aParList.length === 0) {
							aErrors.push('Kein Parser für Tag "' + aXmlObj.name + '" übergeben!')
							useParser = false
						} else if (!aParList[0].match.possible) {
							aErrors.push('Parser konnte Tag "' + aXmlObj.name + '" nicht zugeordnet werden!')
							useParser = false
						} else if (aParList.length > 1 && aParList[0].match.score === aParList[1].match.score) {
							aErrors.push('Parser konnte Tag "' + aXmlObj.name + '" nicht eindeutig zugeordnet werden!')
							useParser = false
						}
						if (useParser && aParList[0].match.errors.length > 0) {
							aErrors.push({'txt': 'Tag "' + aXmlObj.name + '" enthält Fehler!', 'err': aParList[0].match.errors})
							useParser = false
						}
						if (useParser && aParList[0].match.warnings.length > 0) {
							aWarnings.push({'txt': 'Tag "' + aXmlObj.name + '" enthält Warnungen!', 'err': aParList[0].match.warnings})
						}
					} else {
						aErrors.push('Es wurde kein Parser übergeben!')
					}
				}
				if (useParser) {
					this.add(aParList[0].pObj, null, aXmlObj, aErrors, aWarnings, aParList[0].match.ignoreChilds, aParList)
				} else {
					this.add(null, null, aXmlObj, aErrors, aWarnings, null, aParList)
				}
			}, this)
			// console.log('---------------------------------------------')
		}
		this.ready = true
		// ToDo: Fehlende Kinder aus Parser ergänzen
		// aParserChilds.forEach(function (aPar) {
		// 	if (aPar.hasToBeHere(this)) {
		// 		this.add(aPar)
		// 	}
		// }, this)
		if (Object.keys(this.errors).length > 0) {
			return false
		}
		if (this.orgXmlObj && !this.orgXmlObj.useable) {
			return false
		}
		if (this.parserObj && !this.isRoot) {
			this.isMultiple = (this.parserObj.options.get('tag.multiple.use'))		// Ist aktuelles Objekt "multiple"?
		}
		this.useable = true
		return true
	},
	add: function (aPar, pos, orgXml, aErrors = [], aWarnings = [], ignoreChilds = false, aParList) {
		// console.log('EditorObject.add', aPar, pos, orgXml)
		if (pos || pos === 0) {
			// ToDo: An einer bestimmten Stelle einfügen
		} else {
			let aKey = this.childs.push(new Editor.EditorObject(this.root, [this, ...this.parents], aPar, orgXml, false, ignoreChilds)) - 1
			if (aParList) {
				this.childs[aKey].parserMatches = aParList
			}
			aErrors.forEach(function (aErr) {
				this.childs[aKey].addError(aErr)
			}, this)
			aWarnings.forEach(function (aWarn) {
				this.childs[aKey].addWarning(aWarn)
			}, this)
			if (this.root.ready) {
				this.childs.forEach(function (aChild, cKey) {
					aChild.updateData((cKey === aKey))
				})
			}
		}
	},
	updateData: function (withChilds = false) {
		this.count = 0
		this.countParser = 0
		this.multipleNr = 0
		this.multipleLast = false
		let aPrevSibs = this.getSiblings('prev', true, false, true)
		if (aPrevSibs.length > 0) {
			aPrevSibs.forEach(function (aPSib) {
				this.count += 1
				if (aPSib.parserObj === this.parserObj) {
					this.countParser += 1
				}
			}, this)
			if (this.isMultiple && aPrevSibs[0].parserObj === this.parserObj) {
				this.multipleNr = aPrevSibs[0].multipleNr + 1
			}
		}
		if (this.isMultiple) {
			let aNextSibs = this.getSiblings('next', true, false, true)
			this.multipleLast = !(aNextSibs.length > 0 && aNextSibs[0].parserObj === this.parserObj)
		}
		if (this.parserObj && !this.isRoot) {
			this.checkParser()
		}
		this.updateAddableAfter()
		if (withChilds && this.childs.length > 0) {
			this.childs.forEach(function (aChild) {
				aChild.updateData(withChilds)
			}, this)
		}
	},
	updateAddableAfter: function (withChilds = false) {
		this.addableAfter = []
		if (this.parserObj && !this.isRoot) {
			if (this.parserObj.options.get('tag.multiple.use')) {
				this.addableAfter.push({ 'uId': this.parserObj.uId, 'type': 'self', 'title': this.parserObj.options.get('addButton') || this.parserObj.options.get('title.value') || this.parserObj.name })
			}
			let aSibs = this.parserObj.getSiblings('all', true)
			aSibs.forEach(function (aSib) {
				if (aSib.checkPosition(this, true).length === 0) {
					this.addableAfter.push({ 'uId': aSib.uId, 'type': (aSib.options.get('tag.anywhere') ? 'anywhere' : 'ect'), 'title': aSib.options.get('addButton') || aSib.options.get('title.value') || aSib.name })
				}
			}, this)
			// ToDo: Sort!
		}
		if (withChilds && this.childs.length > 0) {
			this.childs.forEach(function (aChild) {
				aChild.updateAddableAfter(withChilds)
			}, this)
		}
	},
	checkParser: function () {
		if (this.orgXmlObj && this.parserObj && this.errors.length === 0) {
			this.deleteErrors()
			this.deleteWarnings()
			let aAttrCheck = this.parserObj.checkAttributes(this.orgXmlObj.attributes)
			let aValCheck = this.parserObj.checkValue(this.orgXmlObj)
			let aPosCheck = this.parserObj.checkPosition(this, true)
			aAttrCheck.err.concat(aValCheck.err).forEach(function (aErr) {
				this.addError(aErr)
			}, this)
			aAttrCheck.warn.concat(aValCheck.warn, aPosCheck).forEach(function (aWarn) {
				this.addWarning(aWarn)
			}, this)
		}
	},
	getSiblings: function (mode = 'all', useable = false, inclSelf = false, withParser = false) {
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
				&& (!withParser || aObj.parserObj)		// Nur mit "parser"
				&& (inclSelf || aObj !== this)) {		// Auch dieses Objekt
					rObj.push(aObj)
				}
			}, this)
		}
		if (mode === 'prev') { rObj.reverse() }
		return rObj
	},
	getChilds: function (mode = 'all', useable = false, aChild = null, inclAChild = false) {
		let rObj = []
		let hit = false
		if (this.childs.length > 0) {
			this.childs.some(function (aObj) {
				if (aObj === aChild) {
					hit = true
				}
				if ((!useable || aObj.useable)		// Nur "useable", falls vorhanden
				&& ((!hit && (mode === 'all' || mode === 'prev'))	// Nur vorherige
					|| (hit && (mode === 'all' || mode === 'next')))		// Nur nachfolgende
				&& (inclAChild || aObj !== aChild)) {		// Auch dieses Objekt
					rObj.push(aObj)
				}
			}, this)
		}
		if (mode === 'prev') { rObj.reverse() }
		return rObj
	},
}

export default localFunctions

function pMatchSort (a, b) {		// Sortieren: "possible" nach oben, Fehler nach unten, höherer Score nach oben
	if (!a.match.possible && b.match.possible) { return 1 }
	if (a.match.possible && !b.match.possible) { return -1 }
	if ((a.match.errors.length > 0) > (b.match.errors.length > 0)) { return 1 }
	if ((a.match.errors.length > 0) < (b.match.errors.length > 0)) { return -1 }
	if (a.match.score < b.match.score) { return 1 }
	if (a.match.score > b.match.score) { return -1 }
	if (a.match.warnings.length > b.match.warnings.length) { return 1 }
	if (a.match.warnings.length < b.match.warnings.length) { return -1 }
	return 0
}
