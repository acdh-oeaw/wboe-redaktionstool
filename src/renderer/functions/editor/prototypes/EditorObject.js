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
			console.log('--- Finde Parser der zu XML Objekt passt! ---')
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
						console.log('aParList - "' + aParList[0].pObj.name + '":', aParList, this)
						if (aParList.length === 0) {
							// this.addError('Kein Parser für Tag "' + aXmlObj.name + '" übergeben!')
							aErrors.push('Kein Parser für Tag "' + aXmlObj.name + '" übergeben!')
							useParser = false
						} else if (!aParList[0].match.possible) {
							// this.addError('Parser konnte Tag "' + aXmlObj.name + '" nicht zugeordnet werden!')
							aErrors.push('Parser konnte Tag "' + aXmlObj.name + '" nicht zugeordnet werden!')
							useParser = false
						} else if (aParList.length > 1 && aParList[0].match.score === aParList[1].match.score) {
							aErrors.push('Parser konnte Tag "' + aXmlObj.name + '" nicht eindeutig zugeordnet werden!')
							useParser = false
						}
						if (useParser && aParList[0].match.errors.length > 0) {
							// this.addError({'txt': 'Tag "' + aXmlObj.name + '" enthält Fehler!', 'err': aParList[0].match.errors})
							aErrors.push({'txt': 'Tag "' + aXmlObj.name + '" enthält Fehler!', 'err': aParList[0].match.errors})
							useParser = false
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
			console.log('---------------------------------------------')
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
		this.useable = true
		return true
	},
	add: function (aPar, pos, orgXml, aErrors, aWarnings, ignoreChilds = false, aParList) {
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
		}
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
