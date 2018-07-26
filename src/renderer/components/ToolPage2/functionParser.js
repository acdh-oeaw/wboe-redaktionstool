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
	var gErrors = []
	var aParPos = 0
	xmlObject.forEach(function (obj, pos) {
		delete obj.errors
		delete obj.parser
		let aCompare = compareIt(obj, pos, parser, xmlObject, aParPos)
		// console.log(obj.n, 'aCompare', aCompare)
		obj.pMatch = aCompare.pMatch
		if (aCompare.errors.length > 0) {
			obj.errors = aCompare.errors
			gErrors.push({'e': aCompare.errors, 'tree': obj.tree})
		}
		if (aCompare.parserKey > -1) {
			obj.parser = parser[aCompare.parserKey]
			if (aCompare.parseChildren && Array.isArray(obj.c) && obj.c.length > 0) {
				let childs = parseIt(obj.c, obj.parser.c)
				obj.c = childs.content
				if (childs.errors.length > 0) {
					gErrors.splice(gErrors.length, 0, ...childs.errors)
					obj.childHasError = true
				}
			}
			if (obj.parser.p.options.value && obj.parser.p.options.value.innerText) {
				delete obj.c
				obj.v = obj.text
			}
			if (!aCompare.stopParPos) {
				aParPos += aCompare.plusParPos
			}
		} else {
			obj.parser = { 'n': '#unknowen', 'p': { 'options': { 'title': { 'value': 'Unbekannt', 'use': true } } } }
			gErrors.push({'e': 'Tag "' + obj.n + '" konnte nicht zugewiesen werden!', 'tree': obj.tree})
		}
	})
	// ToDo: fehlende Parser ermitteln!
	return { 'content': xmlObject, 'errors': gErrors }
}

function compareIt (obj, pos, parser, siblings, parPos, checkChilds = true) {
	var errors = []
	// Berechnen wie hoch die Übereinstimmung ist
	var pMatch = []
	var stopParPos = false
	var plusParPos = 1
	var parseChildren = true
	if (!Array.isArray(parser) || parser.length === 0) {
		errors.push({'e': 'Kein Parser übergeben!'})
		return {'parserKey': -1, 'plusParPos': plusParPos, 'errors': errors}
	}
	parser.some(function (par, pPos) {
		pMatch[pPos] = {'key': pPos, 'score': 0, 'errors': []}
		if (par.n === obj.n) {		// Namen überprüfen
			pMatch[pPos].score += 1
			if (pPos === parPos) {		// Position überprüfen
				pMatch[pPos].score += 1
			} else {
				var isTagPosCorr = false
				if (par.p.options.tag && par.p.options.tag.multiple) {
					if (pPos === parPos - 1) {
						pMatch[pPos].score += 1
						stopParPos = true
						isTagPosCorr = true
					}
				}
				if (!isTagPosCorr) {
					if (pPos > 0 && parser[pPos - 1] && parser[pPos - 1].p.options.tag && parser[pPos - 1].p.options.tag.possibleTag) {
						pMatch[pPos].score += 1
						plusParPos += 1
					} else {
						if (par.p.options.tag && par.p.options.tag.anywhere) {
							pMatch[pPos].score += 1
							// plusParPos += 1
						} else {
							pMatch[pPos].errors.push({'t': 'tag', 'e': 'Position "' + (pPos - parPos) + '" stimmt nicht!'})
						}
					}
				}
			}
			let attrMatchErrors = checkAttributes(obj.p.options.attributes, par.p.options.attributes)		// Attribute überprüfen
			if (attrMatchErrors.length === 0) {
				pMatch[pPos].score += 1
			} else {
				pMatch[pPos].errors.push({'t': 'attributes', 'se': attrMatchErrors})
			}
			let valMatchErrors = checkValue(obj, par.p.options.value)		//	Value überprüfen
			if (valMatchErrors.inner) {
				parseChildren = false
			}
			if (valMatchErrors.errors.length === 0) {
				pMatch[pPos].score += 1
			} else {
				pMatch[pPos].errors.push({'t': 'value', 'se': valMatchErrors.errors})
			}
			if (parseChildren) {
				if (Array.isArray(obj.c) && obj.c.length > 0) {		// Kinder überprüfen
					if (checkChilds) {
						// console.log('Kinder überprüfen!')
						var aParPos = 0
						let accErr = false
						obj.c.some(function (obj, pos) {
							let aCompare = compareIt(obj, pos, par.c, obj.c, aParPos, false)
							// console.log(obj.n, 'aCompare', aCompare)
							if (aCompare.errors.length > 0) {
								pMatch[pPos].errors.push({'t': 'childs', 'e': 'Kinder haben Fehler!', 'se': aCompare.errors})
								accErr = true
								return true
							}
							if (aCompare.parserKey > -1) {
								if (!aCompare.stopParPos) {
									aParPos += aCompare.plusParPos
								}
							}
						})
						if (!accErr) {
							pMatch[pPos].score += 2		// Extra Punkt wenn die Kinder stimmen
						}
					}
				} else if (Array.isArray(par.c) && par.c.length > 0) {
					// ToDo: überprüfen ob die Kinder nur "possibleTag" sind!
					pMatch[pPos].errors.push({'t': 'childs', 'e': 'Keine der erwarteten Kinder da!'})
				}
			}
		} else {
			pMatch[pPos].errors.push({'t': 'tag', 'e': 'Tag Name "' + obj.n + '" stimmt nicht mit "' + par.n + '" überein!'})
		}
	})
	pMatch = pMatch.slice().sort((a, b) => {		// Sortieren: Mehr Fehler nach unten, höherer Score nach oben
		if (a.errors.length > b.errors.length) {
			return 1
		}
		if (a.errors.length < b.errors.length) {
			return -1
		}
		if (a.score < b.score) {
			return 1
		}
		if (a.score > b.score) {
			return -1
		}
		return 0
	})
	// Fehler auswerten:
	var aParserKey = pMatch[0].key
	if (pMatch[0].errors.length > 0) {
		// console.log('pMatch', pMatch, parser)
		errors.push({'e': 'Enthält Fehler!', 'se': pMatch[0].errors})
		aParserKey = -1
	}
	if (checkChilds && pMatch.length > 1) {
		if (pMatch[0].score > 0 && pMatch[0].score === pMatch[1].score) {
			errors.push({'e': 'Zuordnung nicht eindeutig!'})
			aParserKey = -1
		}
	}
	if (pMatch[0].score === 0) {
		errors.push({'e': 'Keine Übereinstimmung gefunden!'})
		aParserKey = -1
	}
	return {'parserKey': aParserKey, 'errors': errors, 'stopParPos': stopParPos, 'plusParPos': plusParPos, 'parseChildren': parseChildren, 'pMatch': pMatch}
}

function checkValue (objValue, parValue) {
	var errors = []
	var inner = false
	// console.log('checkValue', objValue, parValue)
	if (parValue === undefined && (objValue.v !== undefined
	|| (parValue !== undefined && parValue.is !== undefined && parValue.is.value !== undefined)
	|| (parValue !== undefined && parValue.variable !== undefined))) {
		errors.push({'e': 'Es sollte kein Wert vorhanden sein!'})
	} else if (parValue !== undefined) {
		let aVal = objValue.v || ''
		if (parValue.innerText !== undefined) {
			aVal = objValue.text || ''
			inner = true
		}
		if (parValue.edit || parValue.variable) {
			// ToDo: min, max ... usw.
			if ((aVal === undefined || aVal.length === 0) && !parValue.canBeEmpty) {
				errors.push({'e': 'Wert darf nicht leer sein!'})
			} else {
				if (parValue.is && Array.isArray(parValue.is.possibleValues)) {
					if (parValue.is.possibleValues.indexOf(aVal) < 0) {
						errors.push({'e': 'Tag Wert "' + aVal + '" stimmt nicht mit den möglichen Werten überein!'})
					}
				}
			}
		} else {
			if (parValue.is) {
				if (Array.isArray(parValue.is.possibleValues)) {
					if (aVal === undefined || parValue.is.possibleValues.indexOf(aVal) < 0) {
						errors.push({'e': 'Tag Wert "' + aVal + '" stimmt nicht mit den möglichen Werten überein!'})
					}
				} else if (parValue.is.value !== aVal) {
					errors.push({'e': 'Tag Wert "' + aVal + '" stimmt nicht mit Vorlage "' + parValue.is.value + '" überein!'})
				}
			}
		}
	}
	return {'errors': errors, 'inner': inner}
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
					if (aObjAttr[pKey] && aParAttr[pKey].possibleValues.indexOf(aObjAttr[pKey].value) < 0) {
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
			errors.push({'a': pKey, 'e': 'Attribut "' + oKey + '" nicht erwartet.'})
		}
	}
	return errors
}
