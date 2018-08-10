import Vue from 'vue'
import stdFunctions from '@/functions/stdFunctions'
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
					this.add(null, aParList[0].pObj, aXmlObj, aErrors, aWarnings, aParList[0].match.ignoreChilds, aParList)
				} else {
					this.add(null, null, aXmlObj, aErrors, aWarnings, null, aParList)
				}
			}, this)
		}
		if (!this.orgXmlObj && this.parserObj && !this.isRoot) {		// Wenn kein XML Objekt übergeben wurde soll eins erstellt werden
			let aPrevSibs = this.getSiblings('prev', true)
			console.log(this, aPrevSibs)
			if (aPrevSibs.length > 0) {
				console.log('XmlObj erstellen! (After)')
				this.orgXmlObj = aPrevSibs[0].orgXmlObj.addAfterByParser(this.parserObj)
			} else {
				console.log('XmlObj erstellen! (At Top)')
				this.orgXmlObj = this.parents[0].orgXmlObj.addByParser(0, this.parserObj)
			}
			console.log('XmlObj erstellt ...', this.orgXmlObj)
		}
		this.ready = true
		// ToDo: Fehlende Kinder aus Parser ergänzen
		// aParserChilds.forEach(function (aPar) {
		// 	if (aPar.hasToBeHere(this)) {
		// 		this.add(null, aPar)
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
	add: function (pos, aPar, orgXml, aErrors = [], aWarnings = [], ignoreChilds = false, aParList) {
		let aKey = pos
		if (aKey || aKey === 0) {
			this.childs.splice(aKey, 0, new Editor.EditorObject(this.root, [this, ...this.parents], aPar, orgXml, false, ignoreChilds, true))
		} else {
			aKey = this.childs.push(new Editor.EditorObject(this.root, [this, ...this.parents], aPar, orgXml, false, ignoreChilds, true)) - 1
		}
		this.childs[aKey].init()
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
			this.updateData(true)
		}
		return this.childs[aKey]
	},
	addAfter: function (aPar, orgXml, aErrors = [], aWarnings = [], ignoreChilds = false, aParList) {
		if (this.parents.length > 0) {
			let aPos = this.siblings.indexOf(this) + 1
			return this.parents[0].add(aPos, aPar, orgXml, aErrors, aWarnings, ignoreChilds, aParList)
		} else {
			console.log('Editor - Kann nicht hinzugefügt werden!', this)
		}
	},
	move: function (eObj, dir = true) {		// dir = true - Nach eObj verschieben
		// console.log('move', this.siblings.indexOf(this) + ' ' + ((dir) ? 'after' : 'before') + ' ' + this.siblings.indexOf(eObj), this, eObj)
		let tPos = this.siblings.indexOf(this)
		let ePos = this.siblings.indexOf(eObj)
		if (tPos > -1 && ePos > -1) {
			this.siblings.splice(ePos, 0, this.siblings.splice(tPos, 1)[0])
			this.orgXmlObj.move(eObj.orgXmlObj, dir)
		} else {
			console.log('Fehler! Verschieben kann nicht funktionieren!')
		}
		this.siblings.forEach(function (aChild, cKey) {
			aChild.updateData()
		})
		if (this.parents.length > 0) {
			this.parents[0].updateData()
		}
	},
	delete: function (direct = false) {
		if (this.siblings) {
			if (direct || confirm('Soll der Tag "' + (this.parserObj && this.parserObj.name) + '" wirklich gelöscht werden?')) {
				console.log('Editor - Löschen: ' + this.parserObj)
				this.childs.forEach(function (aChild) {
					aChild.delete(true)
				}, this)
				this.root.family[this.uId] = undefined
				this.siblings.some(function (aSib, aSibKey) {
					if (aSib === this) {
						Vue.delete(this.siblings, aSibKey)
						console.log('EditorObject gelöscht ...')
						return true
					}
				}, this)
				this.orgXmlObj.delete(true)
				this.siblings.forEach(function (aChild, cKey) {
					aChild.updateData()
				})
				if (this.parents.length > 0) {
					this.parents[0].updateData()
				}
			}
		} else {
			console.log('Editor - Kann nicht gelöscht werden!', this)
		}
	},
	updateData: function (withChilds = false, posAsError = false) {
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
			this.checkParser(posAsError)
		}
		this.updateAddable()
		if (withChilds && this.childs.length > 0) {
			this.childs.forEach(function (aChild) {
				aChild.updateData(withChilds, posAsError)
			}, this)
		}
	},
	updateAddable: function (withChilds = false) {
		// Nach diesem Tag hinzufügbare Tags
		this.addableAfter = []
		if (this.parserObj && !this.isRoot) {
			if (this.isMultiple) {
				this.addableAfter.push({ 'uId': this.parserObj.uId, 'type': 'self', 'title': this.parserObj.options.get('editor.addTitle') || this.parserObj.options.get('title.value') || this.parserObj.name, 'cShow': true, 'bShow': !(this.isMultiple && !this.multipleLast && this.parserObj.options.get('editor.onlyLastElementHasAddButton')) })
			}
			if (!(this.isMultiple && !this.multipleLast)) {
				let aParSibs = this.parserObj.getSiblings('all', true)
				aParSibs.forEach(function (aParSib) {
					if (aParSib.options.get('tag.anywhere.use')) {
						this.addableAfter.push({ 'uId': aParSib.uId, 'type': 'anywhere', 'title': aParSib.options.get('editor.addTitle') || aParSib.options.get('title.value') || aParSib.name, 'cShow': true, 'bShow': true })
					}
				}, this)
				let startPos = this
				if (this.parserObj.options.get('tag.anywhere.use')) {		// Wenn dieses "EditorObj" ein "anywhere" ist das nächste vorherige "EditorObj" das nicht "anywhere" ist als Startpunkt zu benutzen.
					this.getSiblings('prev', true).some(function (aPrevSib) {
						if (!aPrevSib.parserObj || !aPrevSib.parserObj.options.get('tag.anywhere.use')) {
							startPos = aPrevSib
							return true
						}
					}, this)
				}
				let aParNextSibs = startPos.parserObj.getSiblings('next', true)
				let mHit = false
				let aNextSibs = startPos.getSiblings('next', true)
				aParNextSibs.forEach(function (aParSib) {
					if (!aParSib.options.get('tag.anywhere.use')) {
						let addThis = true
						if (mHit) {
							addThis = false
						} else {
							aNextSibs.forEach(function (aNextSib) {
								if (aNextSib.parserObj === aParSib) {
									addThis = false
									mHit = true
								}
							}, this)
						}
						if (addThis) {
							this.addableAfter.push({ 'uId': aParSib.uId, 'type': 'ect', 'title': aParSib.options.get('editor.addTitle') || aParSib.options.get('title.value') || aParSib.name, 'cShow': true, 'bShow': true })
						}
					}
				}, this)
			}
			this.addableAfter = this.addableAfter.slice().sort(AddableSort)
		}
		// In diesem Tag am Start hinzufügbare Tags
		this.addableInner = []
		if (this.parserObj && !this.isRoot && this.parserObj.childs) {
			let eChilds = this.getChilds('all', true)
			let mHit = false
			this.parserObj.childs.forEach(function (acParser) {
				let addThis = true
				if (!acParser.options.get('tag.anywhere.use')) {
					if (mHit) {
						addThis = false
					} else {
						eChilds.forEach(function (eChild) {
							if (eChild.parserObj === acParser) {
								addThis = false
								mHit = true
							}
						}, this)
					}
				}
				if (addThis) {
					this.addableInner.push({ 'uId': acParser.uId, 'type': (acParser.options.get('tag.anywhere.use') ? 'anywhere' : 'ect'), 'title': acParser.options.get('addButton') || acParser.options.get('title.value') || acParser.name, 'cShow': true, 'bShow': true })
				}
			}, this)
			this.addableInner = this.addableInner.slice().sort(AddableSort)
		}
		// Kinder verarbeiten
		if (withChilds && this.childs.length > 0) {
			this.childs.forEach(function (aChild) {
				aChild.updateAddableAfter(withChilds)
			}, this)
		}
	},
	checkParser: function (posAsError = false) {
		if (this.orgXmlObj && this.parserObj) {
			this.deleteErrors()
			this.deleteWarnings()
			let aAttrCheck = this.parserObj.checkAttributes(this.orgXmlObj.attributes)
			let aValCheck = this.parserObj.checkValue(this.orgXmlObj)
			let aPosCheck = this.parserObj.checkPosition(this, true, true)
			aAttrCheck.err.concat(aValCheck.err, ((posAsError) ? aPosCheck : [])).forEach(function (aErr) {
				this.addError(aErr)
			}, this)
			aAttrCheck.warn.concat(aValCheck.warn, ((!posAsError) ? aPosCheck : [])).forEach(function (aWarn) {
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

function AddableSort (a, b) {		// Sortieren:
	if (a.type !== 'self' && b.type === 'self') { return 1 }
	if (a.type === 'self' && b.type !== 'self') { return -1 }
	if (a.type !== 'ect' && b.type === 'ect') { return 1 }
	if (a.type === 'ect' && b.type !== 'ect') { return -1 }
	if (a.type !== 'anywhere' && b.type === 'anywhere') { return 1 }
	if (a.type === 'anywhere' && b.type !== 'anywhere') { return -1 }
	return 0
}
