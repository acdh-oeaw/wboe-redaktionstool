// import xmlFunctions from '@/functions/XmlFunctions'
// import Editor from '../Editor'

const localFunctions = {
	init: function () {
		if (!(typeof this.uId === 'number') || this.root.family.indexOf[this.uId] === -1) {		// Die "uId" zuweisen falls noch nicht vorhanden
			this.uId = this.root.family.push(this) - 1
		}
		if (!this.isRoot) {
			// ToDo: Parser setzen bzw. mit XML Objekt vergleichen
		}
		// ToDo: Kinder auswerten
		this.ready = true
		if (Object.keys(this.errors).length > 0) {
			return false
		}
		this.useable = true
		return true
	},
}

export default localFunctions
