import Vue from 'vue'
// import xmlFunctions from '@/functions/XmlFunctions'
import stdFunctions from '@/functions/stdFunctions'
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
			eObj.childs.forEach(function (child, cKey) {
				if (!child.orgXmlObj.attributes['xml:id']) {
					let aChildPos = eObj.fxData.places.xFields.indexOf(child.orgXmlObj.attributes.type)
					if (aChildPos > -1) {
						let aChildValPos = stdFunctions.getFirstKeyOfValueInPropertyOfArray(eObj.fxData.places[eObj.fxData.places.pFields[aChildPos]], 'name', child.orgXmlObj.getValue(false))
						if (aChildValPos > -1) {
							child.orgXmlObj.setAttribute('xml:id', eObj.fxData.places[eObj.fxData.places.pFields[aChildPos]][aChildValPos].sigle)
						}
					}
				}
			})
		}
	},
	checkParser (eObj) {
		let warnings = []
		if (!eObj.fxData.placeParser) {
			warnings.push('Es konnte kein "placeParser" gefunden werden!')
		}
		eObj.childs.forEach(function (child, cKey) {
			if (!child.orgXmlObj.attributes['xml:id'] && child.orgXmlObj.getValue(false)) {
				warnings.push('"placeName" (' + child.orgXmlObj.getValue(false) + ') ohne "xml:id" Attribut!')
			}
			if (child.orgXmlObj.attributes.type) {
				let aFieldOption = eObj.fxData.fields[stdFunctions.getFirstKeyOfValueInPropertyOfArray(eObj.fxData.fields, 'name', eObj.fxData.places.pFields[eObj.fxData.places.xFields.indexOf(child.orgXmlObj.attributes.type)])]
				if (!aFieldOption) {
					warnings.push('"placeName" (' + child.orgXmlObj.getValue(false) + ((child.orgXmlObj.attributes['xml:id']) ? ', ' + child.orgXmlObj.attributes['xml:id'] : '') + ') Attribut "' + child.orgXmlObj.attributes.type + '" ist im parser nicht vorgesehen!')
				}
			}
		})
		return warnings
	},
}

export default localFunctions
