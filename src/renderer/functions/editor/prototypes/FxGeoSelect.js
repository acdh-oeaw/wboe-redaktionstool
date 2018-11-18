import Vue from 'vue'
// import xmlFunctions from '@/functions/XmlFunctions'
import stdFunctions from '@/functions/stdFunctions'
// import Editor from '../Editor'

const localFunctions = {
	updateData (eObj, first) {
		if (!eObj.fxFunction) {
			// console.log('GeoSelect - updateData new')
			eObj.fxFunction = 'GeoSelect'
			eObj.fxData.fields = eObj.parserObj.options.get('editor.fxFunction.fields')
			eObj.fxData.places = eObj.parserObj.root.additionalFiles[eObj.parserObj.options.get('editor.fxFunction.filename')].geoSelect
			eObj.fxData.join = ','
			eObj.parserObj.childs.some(function (aPar) {
				if (aPar.name === 'placeName') {
					eObj.fxData.placeParser = aPar
					eObj.fxData.join = aPar.options.get('layout.multiple.join') || ','
					return true
				}
			})
			Vue.set(eObj.fxData, 'selected', {})
		}
		if (eObj.fxData.placeParser) {
			// "placename"s sortieren
			let sorting = true
			let sortDg = 0
			while (sorting && sortDg < 25) {
				let lChild = null
				sortDg += 1
				sorting = false
				eObj.getChilds('all', true).some(function (child) {
					if (child.orgXmlObj.name === 'placeName') {
						if (lChild) {
							let aChildAttrType = child.orgXmlObj.attributes.type
							let lChildAttrType = lChild.orgXmlObj.attributes.type
							if (aChildAttrType && lChildAttrType) {
								let aChildPos = eObj.fxData.places.xFields.indexOf(aChildAttrType)
								let lChildPos = eObj.fxData.places.xFields.indexOf(lChildAttrType)
								if (aChildPos > -1 && lChildPos > -1 && aChildPos < lChildPos) {
									child.move(lChild, false)
									sorting = true
									return true
								}
							}
						}
						lChild = child
					}
				})
			}
			if (sortDg > 1) {
				console.log('sortDg', sortDg)
			}
			let delList = []
			let placeCount = 0
			eObj.getChilds('all', true).forEach(function (child) {
				if (child.orgXmlObj.name === 'placeName') {
					placeCount += 1
					if (!child.orgXmlObj.attributes['xml:id']) {
						if (!child.orgXmlObj.getValue(false)) {
							delList.push(child)
						} else {
							let aChildPos = eObj.fxData.places.xFields.indexOf(child.orgXmlObj.attributes.type)
							if (aChildPos > -1) {
								let aChildValPos = stdFunctions.getFirstObjectOfValueInPropertyOfArray(eObj.fxData.places[eObj.fxData.places.pFields[aChildPos]], 'name', child.orgXmlObj.getValue(false))
								if (aChildValPos) {
									child.orgXmlObj.setAttribute('xml:id', aChildValPos.sigle)
								}
							}
						}
					} else {
						if (child.orgXmlObj.attributes['xml:id'][0] !== 'p') {
							child.orgXmlObj.setAttribute('xml:id', 'p' + child.orgXmlObj.attributes['xml:id'])
						}
						let sVal = stdFunctions.getFirstObjectOfValueInPropertyOfArray(eObj.fxData.places[eObj.fxData.places.pFields[eObj.fxData.places.xFields.indexOf(child.orgXmlObj.attributes.type)]], 'sigle', child.orgXmlObj.attributes['xml:id'])
						if (sVal && child.orgXmlObj.getValue(false) !== sVal.name) {
							child.orgXmlObj.setValue(sVal.name)
						}
					}
				}
			})
			if (placeCount === 0) {
				eObj.add(null, eObj.fxData.placeParser)
			}
			if (delList.length > 0 && placeCount > 0) {
				delList.some(function (aObj, aKey) {
					if (aKey < placeCount - 1) {
						aObj.delete(true)
					}
				})
			}
		}
	},
	checkParser (eObj) {
		let warnings = []
		if (!eObj.fxData.placeParser) {
			warnings.push('Es konnte kein "placeParser" gefunden werden!')
		}
		eObj.getChilds('all', true).forEach(function (child) {
			if (child.orgXmlObj.name === 'placeName') {
				if (!child.orgXmlObj.attributes['xml:id'] && child.orgXmlObj.getValue(false)) {
					warnings.push('"placeName" (' + child.orgXmlObj.getValue(false) + ') ohne "xml:id" Attribut!')
				} else if (child.orgXmlObj.attributes['xml:id']) {
					let foundInPlaces = 0
					eObj.fxData.places.pFields.forEach(function (val) {
						if (stdFunctions.getFirstObjectOfValueInPropertyOfArray(eObj.fxData.places[val], 'sigle', child.orgXmlObj.attributes['xml:id'])) {
							foundInPlaces += 1
						}
					}, this)
					if (foundInPlaces < 1) {
						warnings.push('"placeName" (' + child.orgXmlObj.getValue(false) + ') hat unbekanntes "xml:id" (' + child.orgXmlObj.attributes['xml:id'] + ') Attribut!')
					}
				}
				if (child.orgXmlObj.attributes.type) {
					let aFieldOption = stdFunctions.getFirstObjectOfValueInPropertyOfArray(eObj.fxData.fields, 'name', eObj.fxData.places.pFields[eObj.fxData.places.xFields.indexOf(child.orgXmlObj.attributes.type)])
					if (!aFieldOption) {
						warnings.push('"placeName" (' + child.orgXmlObj.getValue(false) + ((child.orgXmlObj.attributes['xml:id']) ? ', ' + child.orgXmlObj.attributes['xml:id'] : '') + ') Attribut "' + child.orgXmlObj.attributes.type + '" ist im parser nicht vorgesehen!')
					}
				}
			}
		})
		// ToDo: Ist Kombination von Kleinregion zu Großregion zu Bundesland korreckt?
		return warnings
	},
}

export default localFunctions
