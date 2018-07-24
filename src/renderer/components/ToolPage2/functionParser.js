import xmlFunctions from '@/functions/XmlFunctions'

const localFunctions = {
	parseXmlObject: function (parser, orgXmlObject) {
		var match = JSON.parse(JSON.stringify(parser))
		var xmlObject = JSON.parse(JSON.stringify(xmlFunctions.getFirstDescendantsTagByName(orgXmlObject.content, '#document')))
		if (xmlObject === undefined) {
			alert('Fehler! "xmlObject" konnte nicht ausgelesen werden!')
			return undefined
		}
		xmlObject = xmlObject.c
		match.content = parseIt(xmlObject, match.content)
		// console.log(match)
		return match
	}
}

export default localFunctions

function parseIt (xmlObject, parser) {
	xmlObject.forEach(function (obj, pos) {
		console.log(compareIt(obj, pos, parser, xmlObject))
	})
	return parser
}

function compareIt (obj, pos, parser, siblings) {
	var xobj = {}
	// Berechnen wie hoch die Übereinstimmung ist
	var pMatch = []
	parser.some(function (par, pPos) {
		pMatch[pPos] = {'score': 0, 'errors': []}
		if (par.n === obj.n) {		// Namen überprüfen
			pMatch[pPos].score += 1
			if (pPos === pos) {		// Position überprüfen
				pMatch[pPos].score += 1
			} else {
				pMatch[pPos].errors.push({'t': 'tag', 'e': 'Position stimmt nicht!'})
				// ToDo: Kann es trotzdem hier sein?
			}
			let attrMatchErrors = checkAttributes(obj.p.options.attributes, par.p.options.attributes)		// Attribute überprüfen
			if (attrMatchErrors.length === 0) {
				pMatch[pPos].score += 1
			} else {
				pMatch[pPos].errors.push({'t': 'attributes', 'e': attrMatchErrors})
			}
			let valMatchErrors = checkValue(obj, par.p.options.value)		//	Value überprüfen
			if (valMatchErrors.length === 0) {
				pMatch[pPos].score += 1
			} else {
				pMatch[pPos].errors.push({'t': 'value', 'e': valMatchErrors})
			}
		}
	})
	// ToDo: pMatch sortieren nach Fehlern und "score"
	console.log(pMatch)

	return xobj
}

function checkValue (objValue, parValue) {
	var errors = []
	// console.log('checkValue', objValue, parValue)
	if (parValue === undefined && objValue.v !== undefined) {
		errors.push({'e': 'Es sollte kein Wert vorhanden sein!'})
	} else if (parValue !== undefined) {
		let aVal = objValue.v || ''
		// ToDo: innerText ... usw.
		if (aVal === undefined && !parValue.canBeEmpty) {
			errors.push({'e': 'Wert darf nicht leer sein!'})
		}
	}
	return errors
}

function checkAttributes (objAttr, parAttr) {
	var errors = []
	var aObjAttr = objAttr || {}
	var aParAttr = parAttr || {}
	// console.log('checkAttributes', aObjAttr, aParAttr)
	for (var pKey in aParAttr) {
		if (aObjAttr[pKey] === undefined && !aParAttr[pKey].canBeEmpty) {
			errors.push({'a': pKey, 'e': 'Attribut "' + pKey + '" fehlt!'})
		} else {
			if (aParAttr[pKey].type === 'variable') {
				if (aParAttr[pKey].possibleValues !== undefined) {
					if (!aParAttr[pKey].canBeEmpty && (aObjAttr[pKey].value === undefined || aObjAttr[pKey].value.length === 0)) {
						errors.push({'a': pKey, 'e': 'Wert darf nicht leer sein!'})
					}
					if (aParAttr[pKey].possibleValues.indexOf(aObjAttr[pKey].value) < 0) {
						errors.push({'a': pKey, 'e': 'Wert "' + aObjAttr[pKey].value + '" nicht in der Liste möglicher Werte!'})
					}
				}
			}
			if (aParAttr[pKey].type === 'fixed') {
				if (aParAttr[pKey].value !== aObjAttr[pKey].value) {
					errors.push({'a': pKey, 'e': 'Wert "' + aObjAttr[pKey].value + '" stimmt nicht mit dem vorgegebenen Wert "' + aParAttr[pKey].value + '" überein!'})
				}
			}
		}
	}
	for (var oKey in aObjAttr) {		// Überprüfen ob es sich um ein unerwatetes Attribut handelt
		if (aParAttr[oKey] === undefined) {
			errors.push({'a': pKey, 'e': 'Unerwartetes Attribut!'})
		}
	}
	return errors
}
