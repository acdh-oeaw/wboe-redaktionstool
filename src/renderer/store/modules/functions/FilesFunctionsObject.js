// import xmlFunctions from '@/functions/XmlFunctions'

const localFunctions = {
	xml2Obj: function (xmlDom) {
		// var gErrors = []
		// function xml2Obj (xml, tree = []) {
		// 	var errors = []
		// 	var obj = {}
		// 	var rObj = {'unused': true}
		// 	// Kinder verarbeiten
		// 	var childs = []
		// 	var processes = []
		// 	var text = undefined
		// 	if (xml.childNodes.length > 0) {
		// 		xml.childNodes.forEach(function (v) {
		// 			var child = xml2Obj(v, tree.concat(v.nodeName))
		// 			if (child.errors) {
		// 				errors.splice(errors.length, 0, ...child.errors)
		// 			}
		// 			if (child.unused !== true) {
		// 				if (child.isProcess !== true) {
		// 					if (child.obj !== undefined) {
		// 						childs.push(child.obj)
		// 					} else if (child.objs !== undefined) {
		// 						child.objs.forEach(function (o) {
		// 							childs.push(o)
		// 						})
		// 					}
		// 				} else {
		// 					processes.push(child.process)
		// 				}
		// 			} else if (child.text !== undefined) {
		// 				text = child.text
		// 			}
		// 		})
		// 	}
		// 	// Node verarbeiten
		// 	if (xml.nodeType === xml.ELEMENT_NODE) {		// Reguläres Element
		// 		obj.n = xml.nodeName
		// 		if (obj.n === 'xmlParserHeader') {		// Header auswerten
		// 			header = xml.textContent.trim()
		// 			return {'unused': true}
		// 		}
		// 		if (childs.length > 0) {
		// 			obj.c = childs
		// 		}
		// 		// Content setzen
		// 		if (obj.n === 'objParserContent') {
		// 			if (obj.c && obj.c.length > 0) {
		// 				content = obj.c
		// 				return {'unused': true}
		// 			}
		// 		}
		// 		// System setzen
		// 		if (obj.n === 'objParserSystem') {
		// 			if (obj.c && obj.c.length > 0) {
		// 				system = obj.c
		// 				return {'unused': true}
		// 			}
		// 		}
		// 		// Default Processing setzen
		// 		obj.p = defaultProcess()
		// 		// Attribute auswerten
		// 		if (xml.attributes.length > 0) {
		// 			obj.p.options.attributes = {}
		// 			for (var i = 0; i < xml.attributes.length; i++) {
		// 				obj.p.options.attributes[xml.attributes[i].nodeName] = {'value': xml.attributes[i].nodeValue, 'type': 'fixed'}
		// 			}
		// 		}
		// 		// Value auswerten
		// 		if (text !== undefined && childs.length === 0) {
		// 			if (obj.p.options.value) {
		// 				obj.p.options.value = combineProcessingOptions(obj.p.options.value, {'is': {'value': text, 'use': true}})
		// 			} else {
		// 				obj.p.options.value = {'is': {'value': text, 'use': true}}
		// 			}
		// 		}
		// 		// Processing Instruction hinzufügen
		// 		obj.p.options = decompressProcessingOptions(obj.p.options)
		// 		if (processes.length > 0) {
		// 			processes.forEach(function (process) {
		// 				if (process.n === 'options') {
		// 					if (process.p.id) {
		// 						if (!ids[process.p.id]) {
		// 							ids[process.p.id] = {'obj': obj}
		// 						} else {
		// 							let err = 'ID kommt doppelt vor!'
		// 							copyError = true
		// 							errors.push(err)
		// 							gErrors.push({'error': err, 'tree': tree})
		// 							console.log(err)
		// 						}
		// 					}
		// 					obj.p.options = combineProcessingOptions(obj.p.options, decompressProcessingOptions(process.p))
		// 				} else if (process.n === 'for') {
		// 					obj.p.for = process.p
		// 				} else {
		// 					let err = 'Unbekannte "Processing Instruction": "' + process.n + '"'
		// 					errors.push(err)
		// 					gErrors.push({'error': err, 'tree': tree})
		// 					console.log(err)
		// 				}
		// 			})
		// 			// Processing Instruction verarbeiten!
		// 			if (obj.p.options.value && obj.p.options.value.innerText && obj.p.options.value.innerText.use) {
		// 				delete obj.c
		// 				text = ''
		// 				if (xml.childNodes.length > 0) {
		// 					text = xml.innerHTML.replace(/<\?[^?>]*\?>/g, '').trim()
		// 				}
		// 				if (obj.p.options.value) {
		// 					obj.p.options.value = combineProcessingOptions(obj.p.options.value, {'is': {'value': text, 'use': true}})
		// 				} else {
		// 					obj.p.options.value = {'is': {'value': text, 'use': true}}
		// 				}
		// 			}
		// 			// ToDo ...
		// 		}
		// 		// ToDo ...
		// 		// Abschliesende Sachen ...
		// 		if (errors.length > 0) {		// Fehler hinzufügen
		// 			obj.errors = errors
		// 		}
		// 		obj.tree = tree		// Aktueller Ast
		// 		if (Array.isArray(obj.p.for)) {		// For - Multiplikation
		// 			var nObjs = []
		// 			obj.p.for.forEach(function (f, k) {
		// 				var nObj = JSON.parse(JSON.stringify(obj))
		// 				nObj.forKey = k
		// 				nObj.p.options = combineProcessingOptions(nObj.p.options, decompressProcessingOptions(f))
		// 				nObjs.push(nObj)
		// 			})
		// 			return {'objs': nObjs}
		// 		}
		// 		rObj = {'obj': obj}
		// 	} else if (xml.nodeType === xml.PROCESSING_INSTRUCTION_NODE) {		// Processing Instruction Element
		// 		if (xml.nodeName === 'copy') {
		// 			return {'obj': {'n': '#copy', 'p': JSON.parse(xml.textContent), 'tree': tree}}
		// 		} else {
		// 			try {
		// 				return {'isProcess': true, 'process': {'n': xml.nodeName, 'p': JSON.parse(xml.textContent)}}
		// 			} catch (e) {
		// 				let err = 'Node: "' + xml.nodeName + '" - Fehler: "' + e.message + '"'
		// 				errors.push(err)
		// 				gErrors.push({'error': err, 'tree': tree})
		// 				console.log(err)
		// 				return {'errors': errors, 'unused': true}
		// 			}
		// 		}
		// 	} else if (xml.nodeType === xml.TEXT_NODE) {		// Textnode auswerten
		// 		var nVal = xml.nodeValue.trim()
		// 		if (nVal.length > 0) {
		// 			return {'text': nVal, 'unused': true}
		// 		}
		// 	}
		// 	return rObj
		// }
		// xml2Obj(xmlDom)
		// return {'errors': gErrors}
		return xmlDom
	}
}

export default localFunctions
