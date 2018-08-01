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
		// ToDo: Parser mit XML Objekt vergleichen
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
							aParList.push({'pObj': aParObjChild, 'match': aParObjChild.match(aXmlObj)})
						}
					}, this)
					console.log('aParList', aParList)
					aParList = aParList.slice().sort(pMatchSort)		// Sortieren: "possible" nach oben, Fehler nach unten, höherer Score nach oben)
					console.log('aParList', aParList, 'sorted')
					if (aParList.length === 0) {
						// this.addError('Kein Parser für Tag "' + aXmlObj.name + '" übergeben!')
						aErrors.push('Kein Parser für Tag "' + aXmlObj.name + '" übergeben!')
						useParser = false
					} else if (!aParList[0].match.possible) {
						// this.addError('Parser konnte Tag "' + aXmlObj.name + '" nicht zugeordnet werden!')
						aErrors.push('Parser konnte Tag "' + aXmlObj.name + '" nicht zugeordnet werden!')
						useParser = false
					} else if (aParList.length > 1 && aParList[0].match.score === aParList[1].match.score) {
						// this.addError('Parser konnte Tag "' + aXmlObj.name + '" nicht eindeutig zugeordnet werden!')
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
				this.add(aParList[0].pObj, null, aXmlObj, aErrors, aWarnings)
			} else {
				this.add(null, null, aXmlObj, aErrors, aWarnings)
			}
		}, this)
		console.log('---------------------------------------------')
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
		this.useable = true
		return true
	},
	add: function (aPar, pos, orgXml, aErrors, aWarnings) {
		// console.log('EditorObject.add', aPar, pos, orgXml)
		if (pos || pos === 0) {
			// ToDo: An einer bestimmten Stelle einfügen
		} else {
			let aKey = this.childs.push(new Editor.EditorObject(this.root, [this, ...this.parents], aPar, orgXml)) - 1
			aErrors.forEach(function (aErr) {
				this.childs[aKey].addError(aErr)
			}, this)
		}
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
