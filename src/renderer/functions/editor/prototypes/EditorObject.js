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
			console.log('aXmlObj', aXmlObj)
			let aParList = []
			aParserChilds.forEach(function (aParObj) {
				aParList.push({'pObj': aParObj, 'match': aParObj.match(aXmlObj)})
			}, this)
			console.log('aParList', aParList)
		}, this)
		console.log('---------------------------------------------')
		// console.log(this.parserObj.matchXML(this.orgXmlObj))
		if (Object.keys(this.errors).length > 0) {
			return false
		}
		// ToDo: Kinder auswerten
		this.ready = true
		if (Object.keys(this.errors).length > 0) {
			return false
		}
		// ToDo: Fehlende Kinder aus Parser ergänzen
		aParserChilds.forEach(function (aPar) {
			if (aPar.hasToBeHere(this)) {
				this.add(aPar)
			}
		}, this)
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
