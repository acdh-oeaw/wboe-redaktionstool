import xmlFunctions from '@/functions/XmlFunctions'

const localFunctions = {
	xml2ParserObj: function (xmlDom) {
		var header = ''
		var content = []
		var system = []
		var ids = {}
		var gErrors = []
		var copyError = false
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
				obj.p = xmlFunctions.defaultProcess()
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
						obj.p.options.value = xmlFunctions.combineProcessingOptions(obj.p.options.value, {'is': {'value': text, 'use': true}})
					} else {
						obj.p.options.value = {'is': {'value': text, 'use': true}}
					}
				}
				// Processing Instruction hinzufügen
				obj.p.options = xmlFunctions.decompressProcessingOptions(obj.p.options)
				if (processes.length > 0) {
					processes.forEach(function (process) {
						if (process.n === 'options') {
							if (process.p.id) {
								if (!ids[process.p.id]) {
									ids[process.p.id] = {'obj': obj}
								} else {
									let err = 'ID kommt doppelt vor!'
									copyError = true
									errors.push(err)
									gErrors.push({'error': err, 'tree': tree})
									console.log(err)
								}
							}
							obj.p.options = xmlFunctions.combineProcessingOptions(obj.p.options, xmlFunctions.decompressProcessingOptions(process.p))
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
							obj.p.options.value = xmlFunctions.combineProcessingOptions(obj.p.options.value, {'is': {'value': text, 'use': true}})
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
						nObj.p.options = xmlFunctions.combineProcessingOptions(nObj.p.options, xmlFunctions.decompressProcessingOptions(f))
						nObjs.push(nObj)
					})
					return {'objs': nObjs}
				}
				rObj = {'obj': obj}
			} else if (xml.nodeType === xml.PROCESSING_INSTRUCTION_NODE) {		// Processing Instruction Element
				if (xml.nodeName === 'copy') {
					return {'obj': {'n': '#copy', 'p': JSON.parse(xml.textContent), 'tree': tree}}
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
		// Durchführen von "copy":
		if (!copyError) {
			// überprüfen ob das zu Kopierende Element selber Kopien enthält und ggf. setzen
			var hasCopyChild = true
			let whileLoop = 0
			while (hasCopyChild && whileLoop < 1000) {
				hasCopyChild = false
				for (var key in ids) {
					if (Array.isArray(ids[key].obj.c)) {
						let copyChild = xmlFunctions.getFirstDescendantsTagByName(ids[key].obj.c, '#copy')
						let whileLoop2 = 0
						while (copyChild && whileLoop2 < 500) {
							if (ids[copyChild.p.fromId] !== undefined) {
								if (Array.isArray(ids[copyChild.p.fromId].obj.c)) {
									if (xmlFunctions.hasDescendantsTagWithName(ids[copyChild.p.fromId].obj.c, '#copy')) {
										hasCopyChild = true
										break
									} else {
										if (copyChild.p.options) { copyChild.p.options = xmlFunctions.decompressProcessingOptions(copyChild.p.options) }
										copyChild.p = xmlFunctions.combineProcessingOptions(ids[copyChild.p.fromId].obj.p, copyChild.p)
										for (let idKey in ids[copyChild.p.fromId].obj) {
											if (idKey !== 'p') {
												copyChild[idKey] = JSON.parse(JSON.stringify(ids[copyChild.p.fromId].obj[idKey]))
											}
										}
										delete copyChild.p.options.id
									}
								} else {
									if (copyChild.p.options) { copyChild.p.options = xmlFunctions.decompressProcessingOptions(copyChild.p.options) }
									copyChild.p = xmlFunctions.combineProcessingOptions(ids[copyChild.p.fromId].obj.p, copyChild.p)
									for (let idKey in ids[copyChild.p.fromId].obj) {
										if (idKey !== 'p') {
											copyChild[idKey] = JSON.parse(JSON.stringify(ids[copyChild.p.fromId].obj[idKey]))
										}
									}
									delete copyChild.p.options.id
								}
							} else {
								let err = 'Kein Objekt mit ID: "' + copyChild.p.fromId + '" vorhanden!'
								if (!ids[key].obj.errors) { ids[key].obj.errors = [] }
								ids[key].obj.errors.push(err)
								gErrors.push({'error': err, 'tree': ids[key].obj.tree})
							}
							copyChild = xmlFunctions.getFirstDescendantsTagByName(ids[key].obj.c, '#copy')
							whileLoop2 += 1
						}
						if (whileLoop2 >= 500) {
							let err = 'Zuviele Durchgänge für Kopien! Schleife?!?'
							if (!ids[key].obj.errors) { ids[key].obj.errors = [] }
							ids[key].obj.errors.push(err)
							gErrors.push({'error': err, 'tree': ids[key].obj.tree})
						}
					}
				}
				whileLoop += 1
			}
			if (whileLoop >= 1000) {
				gErrors.push({'error': 'Zuviele Durchgänge für Kopien! Schleife?!?', 'tree': ['Vorbereitung für Kopien']})
			}
			// Kopien durchführen
			let copyChild = xmlFunctions.getFirstDescendantsTagByName(content, '#copy')
			whileLoop = 0
			while (copyChild && whileLoop < 1000) {
				if (ids[copyChild.p.fromId] !== undefined) {
					if (copyChild.p.options) { copyChild.p.options = xmlFunctions.decompressProcessingOptions(copyChild.p.options) }
					copyChild.p = xmlFunctions.combineProcessingOptions(ids[copyChild.p.fromId].obj.p, copyChild.p)
					for (let idKey in ids[copyChild.p.fromId].obj) {
						if (idKey !== 'p') {
							copyChild[idKey] = JSON.parse(JSON.stringify(ids[copyChild.p.fromId].obj[idKey]))
						}
					}
					delete copyChild.p.options.id
					copyChild = xmlFunctions.getFirstDescendantsTagByName(content, '#copy')
				} else {
					let err = 'Kein Objekt mit ID: "' + copyChild.p.fromId + '" vorhanden!'
					if (!copyChild.errors) { copyChild.errors = [] }
					copyChild.errors.push(err)
					gErrors.push({'error': err, 'tree': copyChild.tree})
					break
				}
				whileLoop += 1
			}
			if (whileLoop >= 1000) {
				gErrors.push({'error': 'Zuviele Durchgänge für Kopien! Schleife?!?', 'tree': ['Content', 'Kopieren']})
			}
			// ToDo: Copy
		}
		return {'header': header, 'content': content, 'system': system, 'errors': gErrors, 'ids': ids}
	}
}

export default localFunctions
