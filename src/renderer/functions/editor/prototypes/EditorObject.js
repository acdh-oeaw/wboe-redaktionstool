// import xmlFunctions from '@/functions/XmlFunctions'
// import Editor from '../Editor'

const localFunctions = {
	init: function () {
		if (!(typeof this.uId === 'number') || this.root.family.indexOf[this.uId] === -1) {		// Die "uId" zuweisen falls noch nicht vorhanden
			this.uId = this.root.family.push(this) - 1
		}
		let aParserChilds = this.parserObj.childs || []
		let aXmlChilds = this.orgXmlObj.childs || []
		if (this.isRoot) {
			aParserChilds = this.parserObj.content || []
			aXmlChilds = this.orgXmlObj.content || []
		}
		// ToDo: Parser mit XML Objekt vergleichen
		console.log('--- Finde Parser das zu XML Objekt passt! ---')
		aXmlChilds.forEach(function (aXmlObj) {
			let aParList = []
			if (aParserChilds.length > 0) {
				aParserChilds.forEach(function (aParObj) {
					aParList.push({'pObj': aParObj, 'match': aParObj.match(aXmlObj)})
				}, this)
				console.log('aParList', aParList)
				aParList = aParList.slice().sort(pMatchSort)		// Sortieren: "possible" nach oben, Fehler nach unten, höherer Score nach oben)
				console.log('aParList', aParList, 'sorted')
			}
			let useParser = true
			if (aParList.length === 0) {
				this.addError('Kein Parser für Tag "' + aXmlObj.name + '" übergeben!')
				useParser = false
			} else if (!aParList[0].match.possible) {
				this.addError('Parser konnte Tag "' + aXmlObj.name + '" nicht zugeordnet werden!')
				useParser = false
			} else if (aParList.length > 1 && aParList[0].match.score === aParList[1].match.score) {
				this.addError('Parser konnte Tag "' + aXmlObj.name + '" nicht eindeutig zugeordnet werden!')
				useParser = false
			}
			if (aParList[0].match.errors.length > 0) {
				this.addError({'txt': 'Tag "' + aXmlObj.name + '" enthält Fehler!', 'err': aParList[0].match.errors})
				useParser = false
			}
			if (useParser) {
				this.add(aParList[0].pObj, null, aXmlObj)
			} else {
				this.add(null, null, aXmlObj)
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
	add: function (aPar, pos, orgXml) {
		console.log('EditorObject.add', aPar, pos, orgXml)
	},
}

export default localFunctions

function pMatchSort (a, b) {		// Sortieren: "possible" nach oben, Fehler nach unten, höherer Score nach oben
	if (a.match.possible && !b.match.possible) { return 1 }
	if (!a.match.possible && b.match.possible) { return -1 }
	if ((a.match.errors.length > 0) > (b.match.errors.length > 0)) { return 1 }
	if ((a.match.errors.length > 0) < (b.match.errors.length > 0)) { return -1 }
	if (a.match.score < b.match.score) { return 1 }
	if (a.match.score > b.match.score) { return -1 }
	if (a.match.warnings.length > b.match.warnings.length) { return 1 }
	if (a.match.warnings.length < b.match.warnings.length) { return -1 }
	return 0
}
