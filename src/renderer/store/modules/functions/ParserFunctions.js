const localFunctions = {
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
}

export default localFunctions
