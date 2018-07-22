const defaultProcess = function () {
	return {
		'options': {
			'tagAsTitle': true,
			'attributes': undefined
		}
	}
}
const defaultLayout = function () { return {'use': true} }
const defaultValue = function () { return {'use': true} }
const defaultAttributes = function () { return {'type': 'variable'} }

const localFunctions = {
	xml2ParserObj: function (xmlDom) {
		var header = ''
		var content = []
		var system = []
		var ids = {}
		var gErrors = []
		function xml2Obj (xml, tree = []) {
			var errors = []
			var obj = {}
			var rObj = {'unused': true}
			// Kinder verarbeiten
			var childs = []
			var processes = []
			var text = undefined
			if (xml.childNodes.length > 0) {
				xml.childNodes.forEach(function (v) {
					var child = xml2Obj(v, tree.concat(v.nodeName))
					if (child.errors) {
						errors.splice(errors.length, 0, ...child.errors)
					}
					if (child.unused !== true) {
						if (child.isProcess !== true) {
							if (child.obj !== undefined) {
								childs.push(child.obj)
							} else if (child.objs !== undefined) {
								child.objs.forEach(function (o) {
									childs.push(o)
								})
							}
						} else {
							processes.push(child.process)
						}
					} else if (child.text !== undefined) {
						text = child.text
					}
				})
			}
			// Node verarbeiten
			if (xml.nodeType === xml.ELEMENT_NODE) {		// Reguläres Element
				obj.n = xml.nodeName
				if (obj.n === 'xmlParserHeader') {		// Header auswerten
					header = xml.textContent.trim()
					return {'unused': true}
				}
				if (childs.length > 0) {
					obj.c = childs
				}
				// Content setzen
				if (obj.n === 'objParserContent') {
					if (obj.c && obj.c.length > 0) {
						content = obj.c
						return {'unused': true}
					}
				}
				// System setzen
				if (obj.n === 'objParserSystem') {
					if (obj.c && obj.c.length > 0) {
						system = obj.c
						return {'unused': true}
					}
				}
				// Default Processing setzen
				obj.p = defaultProcess()
				// Attribute auswerten
				if (xml.attributes.length > 0) {
					obj.p.options.attributes = {}
					for (var i = 0; i < xml.attributes.length; i++) {
						obj.p.options.attributes[xml.attributes[i].nodeName] = {'value': xml.attributes[i].nodeValue, 'type': 'fixed'}
					}
				}
				// Value auswerten
				if (text !== undefined && childs.length === 0) {
					if (obj.p.options.value) {
						obj.p.options.value = combineProcessingOptions(obj.p.options.value, {'is': {'value': text, 'use': true}})
					} else {
						obj.p.options.value = {'is': {'value': text, 'use': true}}
					}
				}
				// Processing Instruction hinzufügen
				obj.p.options = decompressProcessingOptions(obj.p.options)
				if (processes.length > 0) {
					processes.forEach(function (process) {
						if (process.n === 'options') {
							obj.p.options = combineProcessingOptions(obj.p.options, decompressProcessingOptions(process.p))
						} else if (process.n === 'for') {
							obj.p.for = process.p
						} else {
							let err = 'Unbekannte "Processing Instruction": "' + process.n + '"'
							errors.push(err)
							gErrors.push({'error': err, 'tree': tree})
							console.log(err)
						}
					})
					// Processing Instruction verarbeiten!
					if (obj.p.options.value && obj.p.options.value.innerText && obj.p.options.value.innerText.use) {
						delete obj.c
						text = ''
						if (xml.childNodes.length > 0) {
							text = xml.innerHTML.replace(/<\?[^?>]*\?>/g, '').trim()
						}
						if (obj.p.options.value) {
							obj.p.options.value = combineProcessingOptions(obj.p.options.value, {'is': {'value': text, 'use': true}})
						} else {
							obj.p.options.value = {'is': {'value': text, 'use': true}}
						}
					}
					// ToDo ...
				}
				// ToDo ...
				// Abschliesende Sachen ...
				if (errors.length > 0) {		// Fehler hinzufügen
					obj.errors = errors
				}
				obj.tree = tree		// Aktueller Ast
				if (Array.isArray(obj.p.for)) {		// For - Multiplikation
					var nObjs = []
					obj.p.for.forEach(function (f, k) {
						var nObj = JSON.parse(JSON.stringify(obj))
						nObj.forKey = k
						nObj.p.options = combineProcessingOptions(nObj.p.options, decompressProcessingOptions(f))
						nObjs.push(nObj)
					})
					return {'objs': nObjs}
				}
				rObj = {'obj': obj}
			} else if (xml.nodeType === xml.PROCESSING_INSTRUCTION_NODE) {		// Processing Instruction Element
				if (xml.nodeName === 'copy') {
					// ToDo: COPY?!?
				} else {
					try {
						return {'isProcess': true, 'process': {'n': xml.nodeName, 'p': JSON.parse(xml.textContent)}}
					} catch (e) {
						let err = 'Node: "' + xml.nodeName + '" - Fehler: "' + e.message + '"'
						errors.push(err)
						gErrors.push({'error': err, 'tree': tree})
						console.log(err)
						return {'errors': errors, 'unused': true}
					}
				}
			} else if (xml.nodeType === xml.TEXT_NODE) {		// Textnode auswerten
				var nVal = xml.nodeValue.trim()
				if (nVal.length > 0) {
					return {'text': nVal, 'unused': true}
				}
			}
			return rObj
		}
		xml2Obj(xmlDom)
		return {'header': header, 'content': content, 'system': system, 'errors': gErrors, 'ids': ids}
	}
}

function decompressProcessingOptions (options) {		// Optionen dekomprimieren
	var deflat = JSON.parse(JSON.stringify(options))
	for (var key in deflat) {
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
					deflat[key][cKey] = combineProcessingOptions(defaultAttributes(), deflat[key][cKey])
				}
			}
			deflat[key] = dcpoSimpleToComplex(deflat[key], defaultAttributes(), {'prop': 'value', 'std': {'type': 'fixed'}})
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
			deflat[key] = dcpoSimpleToComplex(deflat[key], defaultValue())
		}
		// layout
		if ((key === 'layout' && deflat[key] !== undefined)) {
			deflat[key] = checkLayout(deflat[key])
		}
		// editor > layout
		if (key === 'editor' && deflat[key] !== undefined && deflat[key].layout !== undefined) {
			deflat[key].layout = checkLayout(deflat[key].layout)
		}
		// html > layout
		if (key === 'html' && deflat[key] !== undefined && deflat[key].layout !== undefined) {
			deflat[key].layout = checkLayout(deflat[key].layout)
		}
	}
	// console.log('decompressProcessingOptions', JSON.parse(JSON.stringify(options)), JSON.parse(JSON.stringify(deflat)))
	return deflat
}

function combineProcessingOptions (orgOptions, newOptions) {
	var comOptions = JSON.parse(JSON.stringify(orgOptions))
	if (Array.isArray(newOptions)) {
		console.log('combineProcessingOptions - array !!!???')
	} else if (typeof newOptions === 'object') {
		for (var key in newOptions) {
			if (comOptions[key] !== undefined) {
				comOptions[key] = combineProcessingOptions(comOptions[key], newOptions[key])
			} else {
				comOptions[key] = newOptions[key]
			}
		}
	} else {
		return newOptions
	}
	return comOptions
}

function checkLayout (layout) {		// Layout dekomprimieren
	var deflat = JSON.parse(JSON.stringify(layout))
	if (Array.isArray(deflat)) {
		var nObjValue = {}
		deflat.forEach(function (value) {
			if (typeof value === 'string') {
				nObjValue[value] = defaultLayout()
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
				deflat[key] = dcpoSimpleToComplex(deflat[key], defaultLayout())
			}
		}
	}
	// console.log('layout', JSON.parse(JSON.stringify(layout)), JSON.parse(JSON.stringify(deflat)), Array.isArray(deflat))
	return deflat
}

function dcpoSimpleToComplex (content, standard, str2Val = undefined) {
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
						nObjValue[valueKey] = combineProcessingOptions(str2Val.std, nVal)
					} else {
						nObjValue[valueKey] = combineProcessingOptions(standard, nVal)
					}
				}
			}
		})
		return nObjValue
	}
	return content
}

export default localFunctions
