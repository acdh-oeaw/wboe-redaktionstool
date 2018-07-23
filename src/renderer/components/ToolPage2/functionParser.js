import xmlFunctions from '@/functions/XmlFunctions'

const localFunctions = {
	parseXmlObject: function (parser, orgXmlObject) {
		var xmlObject = xmlFunctions.getFirstDescendantsTagByName(orgXmlObject.content, '#document')
		if (xmlObject === undefined) {
			alert('Fehler! "xmlObject" konnte nicht ausgelesen werden!')
			return undefined
		}
		xmlObject = xmlObject.c
		// ToDo: Auswertung
		console.log(xmlObject)
		return parser
	}
}

export default localFunctions
