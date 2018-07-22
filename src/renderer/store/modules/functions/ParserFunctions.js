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
	}
}

export default localFunctions
