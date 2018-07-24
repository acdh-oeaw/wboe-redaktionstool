import xmlFunctions from '@/functions/XmlFunctions'

const localFunctions = {
	parseXmlObject: function (parser, orgXmlObject) {
		var match = JSON.parse(JSON.stringify(parser))
		var xmlObject = JSON.parse(JSON.stringify(xmlFunctions.getFirstDescendantsTagByName(orgXmlObject.content, '#document')))
		if (xmlObject === undefined) {
			alert('Fehler! "xmlObject" konnte nicht ausgelesen werden!')
			return undefined
		}
		xmlObject = parseIt(xmlObject.c, match.content)
		return xmlObject
	}
}

export default localFunctions

function parseIt (xmlObject, parser) {
	xmlObject.forEach(function (obj, pos) {
		let aCompare = compareIt(obj, pos, parser, xmlObject)
		if (aCompare.errors.length > 0) {
			obj.error = aCompare.errors
		}
		if (aCompare.parserKey > -1) {
			console.log(obj.n, 'compareIt', aCompare)
			obj.parser = parser[aCompare.parserKey]
			if (Array.isArray(obj.c) && obj.c.length > 0) {
				obj.c = parseIt(obj.c, obj.parser)
			}
		} else {
			console.log(obj.n, '#unknowen')
			obj.parser = { 'n': '#unknowen', 'p': { 'options': { 'title': { 'value': 'Unbekannt', 'use': true } } } }
		}
	})
	return xmlObject
}

function compareIt (obj, pos, parser, siblings) {
	var errors = []
	// Berechnen wie hoch die Übereinstimmung ist
	var pMatch = []
	if (!Array.isArray(parser) || parser.length === 0) {
		errors.push({'e': 'Kein parser übergeben!'})
		return {'parserKey': -1, 'errors': errors}
	}
	parser.some(function (par, pPos) {
		pMatch[pPos] = {'key': pPos, 'score': 0, 'errors': []}
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
				pMatch[pPos].errors.push({'t': 'attributes', 'se': attrMatchErrors})
			}
			let valMatchErrors = checkValue(obj, par.p.options.value)		//	Value überprüfen
			if (valMatchErrors.length === 0) {
				pMatch[pPos].score += 1
			} else {
				pMatch[pPos].errors.push({'t': 'value', 'se': valMatchErrors})
			}
		} else {
			pMatch[pPos].errors.push({'t': 'tag', 'e': 'Keine Übereinstimmung gefunden!'})
		}
	})
	// ToDo: pMatch sortieren nach Fehlern und "score"
	// Fehler auswerten:
	if (pMatch[0].errors.length > 0) {
		errors.push({'e': 'Enthält Fehler!', 'se': pMatch[0].errors})
	}
	if (pMatch.length > 1) {
		if (pMatch[0].score === pMatch[1].score) {
			errors.push({'e': 'Zuordnung nicht eindeutig!'})
		}
	}
	if (pMatch[0].score === 0) {
		errors.push({'e': 'Keine Übereinstimmung gefunden!'})
	}
	return {'parserKey': pMatch[0].key, 'errors': errors}
}

function checkValue (objValue, parValue) {
	var errors = []
	// console.log('checkValue', objValue, parValue)
	if (parValue === undefined && objValue.v !== undefined) {
		errors.push({'e': 'Es sollte kein Wert vorhanden sein!'})
	} else if (parValue !== undefined) {
		let aVal = objValue.v || ''
		// ToDo: innerText, min, max ... usw.
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
