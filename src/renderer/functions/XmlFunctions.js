const localFunctions = {
	string2xmlDom: function (string, showAlert = true) {
		var xmlDom = new DOMParser().parseFromString(string, 'application/xml')
		var xmlStringError = localFunctions.xmlDomCheck(xmlDom)
		if (xmlStringError.length > 0) {
			if (showAlert) {
				alert('Beim verarbeiten der XML ist es zu einen Fehler gekommen:\n\n' + xmlStringError)
			}
			return { 'xmlDom': undefined, 'errors': xmlStringError }
		}
		return { 'xmlDom': xmlDom }
	},
	xmlDomCheck: function (xmlDom, error = false) {		// Eventuelle Fehlermeldung des DOM-Objekts ausgeben
		var txt = ''
		var x = xmlDom.childNodes
		for (var i = 0; i < x.length; i++) {
			var y = x[i]
			if (y.nodeType === y.TEXT_NODE) {
				if (error) {
					txt += y.nodeValue + '\n'
				}
			} else {
				if (y.childNodes[0] !== undefined) {
					txt += localFunctions.xmlDomCheck(y, error || y.nodeName === 'parsererror')
				}
			}
		}
		return txt
	},
	hasDescendantsTagWithName: function (childs, tagName) {
		var hasIt = false
		if (Array.isArray(childs)) {
			childs.some(function (c) {
				if (c.n === tagName) {
					hasIt = true
					return true
				}
				if (c.c) {
					hasIt = localFunctions.hasDescendantsTagWithName(c.c, tagName)
					if (hasIt) { return true }
				}
			})
		}
		return hasIt
	},
	getFirstDescendantsTagByName: function (childs, tagName) {
		var obj = undefined
		if (Array.isArray(childs)) {
			childs.some(function (c) {
				if (c.n === tagName) {
					obj = c
					return true
				}
				if (c.c) {
					obj = localFunctions.getFirstDescendantsTagByName(c.c, tagName)
					if (obj !== undefined) { return true }
				}
			})
		}
		return obj
	},
	defaultProcess: function () {
		return {
			'options': {
				'tagAsTitle': true,
				'attributes': undefined
			}
		}
	},
	defaultLayout: function () { return {'use': true} },
	defaultValue: function () { return {'use': true} },
	defaultTag: function () { return {'use': true} },
	defaultAttributes: function () { return {'type': 'variable'} },
	decompressProcessingOptions: function (options) {		// Optionen dekomprimieren
		var deflat = JSON.parse(JSON.stringify(options))
		for (var key in deflat) {
			// tag
			if (key === 'tag' && deflat[key] !== undefined) {
				deflat[key] = localFunctions.dcpoSimpleToComplex(deflat[key], localFunctions.defaultTag())
			}
			// title
			if (key === 'title' && typeof deflat[key] === 'string') {
				deflat[key] = {'value': deflat[key], 'use': true}
			}
			// attributes
			if (key === 'attributes' && deflat[key] !== undefined) {
				if (typeof deflat[key] === 'object' && !Array.isArray(deflat[key])) {
					for (var cKey in deflat[key]) {
						if (typeof deflat[key][cKey] === 'string') {
							deflat[key][cKey] = {'value': deflat[key][cKey], 'type': 'fixed'}
						}
						deflat[key][cKey] = localFunctions.combineProcessingOptions(localFunctions.defaultAttributes(), deflat[key][cKey])
					}
				}
				deflat[key] = localFunctions.dcpoSimpleToComplex(deflat[key], localFunctions.defaultAttributes(), {'prop': 'value', 'std': {'type': 'fixed'}})
				for (var attrKey in deflat[key]) {
					for (var attrOption in deflat[key][attrKey]) {
						if (attrOption === 'possibleValues' && typeof deflat[key][attrKey][attrOption] === 'string') {
							deflat[key][attrKey][attrOption] = [deflat[key][attrKey][attrOption]]
						}
					}
				}
			}
			// value
			if (key === 'value' && deflat[key] !== undefined) {
				deflat[key] = localFunctions.dcpoSimpleToComplex(deflat[key], localFunctions.defaultValue())
			}
			// layout
			if ((key === 'layout' && deflat[key] !== undefined)) {
				deflat[key] = localFunctions.checkLayout(deflat[key])
			}
			// editor > layout
			if (key === 'editor' && deflat[key] !== undefined && deflat[key].layout !== undefined) {
				deflat[key].layout = localFunctions.checkLayout(deflat[key].layout)
			}
			// html > layout
			if (key === 'html' && deflat[key] !== undefined && deflat[key].layout !== undefined) {
				deflat[key].layout = localFunctions.checkLayout(deflat[key].layout)
			}
		}
		// console.log('decompressProcessingOptions', JSON.parse(JSON.stringify(options)), JSON.parse(JSON.stringify(deflat)))
		return deflat
	},
	combineProcessingOptions: function (orgOptions, newOptions) {
		var comOptions = JSON.parse(JSON.stringify(orgOptions))
		if (Array.isArray(newOptions)) {
			console.log('combineProcessingOptions - array !!!???')
		} else if (typeof newOptions === 'object') {
			for (var key in newOptions) {
				if (comOptions[key] !== undefined) {
					comOptions[key] = localFunctions.combineProcessingOptions(comOptions[key], newOptions[key])
				} else {
					comOptions[key] = newOptions[key]
				}
			}
		} else {
			return newOptions
		}
		return comOptions
	},
	checkLayout: function (layout) {		// Layout dekomprimieren
		var deflat = JSON.parse(JSON.stringify(layout))
		if (Array.isArray(deflat)) {
			var nObjValue = {}
			deflat.forEach(function (value) {
				if (typeof value === 'string') {
					nObjValue[value] = localFunctions.defaultLayout()
				} else if (typeof value === 'object') {
					for (var valueKey in value) {
						nObjValue[valueKey] = value[valueKey]
					}
				}
			})
			deflat = nObjValue
		}
		if (typeof deflat === 'object') {
			for (var key in deflat) {
				if (key === 'class' && deflat[key] !== undefined) {
					deflat[key] = localFunctions.dcpoSimpleToComplex(deflat[key], localFunctions.defaultLayout())
				}
			}
		}
		// console.log('layout', JSON.parse(JSON.stringify(layout)), JSON.parse(JSON.stringify(deflat)), Array.isArray(deflat))
		return deflat
	},
	dcpoSimpleToComplex: function (content, standard, str2Val = undefined) {
		if (typeof content === 'string') {
			return {[content]: standard}
		} else if (Array.isArray(content)) {
			var nObjValue = {}
			content.forEach(function (value) {
				if (typeof value === 'string') {
					nObjValue[value] = standard
				} else if (typeof value === 'object') {
					for (var valueKey in value) {
						var nVal = value[valueKey]
						if (str2Val !== undefined && typeof nVal === 'string') {
							nVal = {[str2Val.prop]: nVal}
							nObjValue[valueKey] = localFunctions.combineProcessingOptions(str2Val.std, nVal)
						} else {
							nObjValue[valueKey] = localFunctions.combineProcessingOptions(standard, nVal)
						}
					}
				}
			})
			return nObjValue
		}
		return content
	},
}

export default localFunctions