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
			// "placename"s sortieren
			let sorting = true
			let sortDg = 0
			while (sorting && sortDg < 10) {
				sorting = false
				eObj.childs.some(function (child, cKey) {
					if (cKey > 0) {
						let aChildAttrType = child.orgXmlObj.attributes.type
						let lChildAttrType = eObj.childs[cKey - 1].orgXmlObj.attributes.type
						if (aChildAttrType && lChildAttrType) {
							let aChildPos = eObj.fxData.places.xFields.indexOf(aChildAttrType)
							let lChildPos = eObj.fxData.places.xFields.indexOf(lChildAttrType)
							if (aChildPos > -1 && lChildPos > -1 && aChildPos < lChildPos) {
								child.move(eObj.childs[cKey - 1], false)
								sorting = true
							}
						}
					}
				})
				sortDg += 1
			}
			// "placename"s auswerten
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
