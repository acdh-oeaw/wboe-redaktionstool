import Vue from 'vue'
// import xmlFunctions from '@/functions/XmlFunctions'
// import Editor from '../Editor'

const localFunctions = {
	updateData (eObj, first) {
		if (!eObj.fxFunction) {
			console.log('GeoSelect - updateData new')
			eObj.fxFunction = 'GeoSelect'
			eObj.fxData.fields = eObj.parserObj.options.get('editor.fxFunction.fields')
			eObj.fxData.places = eObj.parserObj.root.additionalFiles[eObj.parserObj.options.get('editor.fxFunction.filename')].geoSelect
			eObj.parserObj.childs.some(function (aPar) {
				if (aPar.name === 'placeName') {
					eObj.fxData.placeParser = aPar
					return true
				}
			}, this)
			Vue.set(eObj.fxData, 'selected', {})
		}
		if (eObj.fxData.placeParser) {
			// Verarbeiten ...
		}
	},
	checkParser (eObj) {
		let warnings = []
		if (!eObj.fxData.placeParser) {
			warnings.push('Es konnte kein "placeParser" gefunden werden!')
		}
		return warnings
	},
}

export default localFunctions
