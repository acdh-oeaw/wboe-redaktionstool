// import xmlFunctions from '@/functions/XmlFunctions'

const localFunctions = {
	xml2Obj: function (xmlDom) {
		var gErrors = []
		function xml2Obj (xml, tree = []) {
			var errors = []
			var obj = {}
			// Kinder verarbeiten
			var childs = []
			var processes = []
			var text = undefined
			if (xml.childNodes.length > 0) {
				xml.childNodes.forEach(function (v) {
					var child = xml2Obj(v, tree.concat(v.nodeName))
					if (child !== undefined) {
						if (child.errors !== undefined) {
							errors.splice(errors.length, 0, ...child.errors)
						}
						if (child.obj !== undefined) {
							childs.push(child.obj)
						} else if (child.process !== undefined) {
							processes.push(child.process)
						} else if (child.text !== undefined) {
							text = child.text
							childs.push({'n': '#text', 'v': child.text})
						}
					}
				})
			}
			// Node verarbeiten
			if (xml.nodeType === xml.ELEMENT_NODE) {		// Reguläres Element
				obj.n = xml.nodeName
				obj.p = { 'options': { 'attributes': undefined } }
				if (childs.length > 0 && !(childs.length === 1 && text !== undefined)) {
					obj.c = childs
				}
				if (processes.length > 0) {
					obj.p.xp = processes
				}
				// Attribute auswerten
				if (xml.attributes.length > 0) {
					obj.p.options.attributes = {}
					for (var i = 0; i < xml.attributes.length; i++) {
						obj.p.options.attributes[xml.attributes[i].nodeName] = {'value': xml.attributes[i].nodeValue}
					}
				}
				// Value auswerten
				if (text !== undefined && childs.length <= 1) {
					obj.v = text
				}
				// Abschliesende Sachen ...
				if (errors.length > 0) {		// Fehler hinzufügen
					obj.errors = errors
				}
				obj.tree = tree		// Aktueller Ast
				obj.text = xml.textContent
				obj.xml = xml.innerHTML		// ToDo: Kommentare und PROCESSING_INSTRUCTION_NODE entfernen
				return {'obj': obj}
			} else if (xml.nodeType === xml.PROCESSING_INSTRUCTION_NODE) {		// Processing Instruction Element
				return {'process': {'n': xml.nodeName, 'c': xml.textContent}}
			} else if (xml.nodeType === xml.TEXT_NODE) {		// Textnode auswerten
				var nVal = xml.nodeValue.trim()
				if (nVal.length > 0) {
					return {'text': nVal}
				}
			} else if (xml.nodeType === xml.DOCUMENT_NODE) {
				if (childs.length > 0) {
					obj.n = xml.nodeName
					if (childs.length > 0) {
						obj.c = childs
					}
					return {'obj': obj}
				}
			}
		}
		var content = xml2Obj(xmlDom)
		return {'content': [content.obj], 'errors': gErrors}
	}
}

export default localFunctions
