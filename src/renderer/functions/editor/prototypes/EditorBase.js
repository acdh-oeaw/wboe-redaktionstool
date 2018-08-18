// import xmlFunctions from '@/functions/XmlFunctions'
import Editor from '../Editor'

const localFunctions = {
	init () {
		if (!this.parserObj) {
			this.addError('Es wurde kein "parserObject" übergeben!')
			return false
		}
		this.contentObj = new Editor.EditorObject(this, null, this.parserObj, this.orgXmlObj, true)
		if (!this.contentObj) {
			this.addError('Kein "contentObj" vorhanden!')
		}
		this.contentObj.updateData(true, true)
		this.ready = true
		if (Object.keys(this.errors).length > 0) {
			return false
		}
		this.useable = true
		return true
	},
	getXML () {
		return (this.parserObj.header || '') + this.orgXmlObj.getXML()
	}
}

export default localFunctions
