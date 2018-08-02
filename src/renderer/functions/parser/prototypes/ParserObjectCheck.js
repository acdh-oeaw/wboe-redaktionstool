// import xmlFunctions from '@/functions/XmlFunctions'

const localFunctions = {
	checkPosition: function (xmlObj, editorObj) {
		let errors = []
		let aTagOption = this.options.get('tag')
		console.log(aTagOption)
		if (!aTagOption || !(aTagOption.anywhere && aTagOption.anywhere.use)) {		// Feste Position
			let parserPrev = this.getSiblings('prev', true)
			let editorPrev = editorObj.getChilds('prev', true)		// ToDo: Wenn nachkontrolliert wird?!? Aktuelles EditorObj.getSiblings(...)
			if (parserPrev.length > 0 || editorPrev.length > 0) {		// Wenn einer von beide nicht an erster Position
				if (editorPrev.length > 0 && parserPrev.length === 0) {		// Wenn eigentlich an erster Stelle
					editorPrev.some(function (aEditor) {
						if (!aEditor.parserObj || !aEditor.parserObj.options.get('tag.anywhere.use')) {		// Wenn nicht "anywhere" weiter kontrollieren
							if (!aEditor.parserObj || !(aEditor.parserObj === this && aTagOption && aTagOption.multiple && aTagOption.multiple.use)) {		// Wenn kein "multiple" ...
								errors.push('Position: Sollte an erster Stelle stehen!')
								return true
							}
						}
					}, this)
				} else if (editorPrev.length === 0 && parserPrev.length > 0) {		// Wenn an erster Stelle aber Parser nicht
					parserPrev.some(function (aParser) {
						if (!(aParser.options.get('tag.anywhere.use') || aParser.options.get('tag.possibleTag.use'))) {		// Wenn vorhergehender Parser weder "anywhere" noch "possibleTag" ist
							errors.push('Position: Tag "' + aParser.name + '" sollte vorher stehen!')
							return true
						}
					}, this)
				} else {		// Vorherige Parser- und Editorobjekte vergleichen
					if (!(aTagOption && aTagOption.anywhere && aTagOption.anywhere.use)) {		// Wenn Tag ist nicht "anywhere", weiter prüfen
						if (editorPrev[0].parserObj !== parserPrev[0]) {		// Wenn die vorgänger Objekte nicht übereinstimmen, weiter prüfen
							if (!(aTagOption && aTagOption.multiple && aTagOption.multiple.use && this === editorPrev[0].parserObj)) {		// Wenn aktuelles Tag ist nicht multiple oder parser stimmt nicht mit vorherigen überein, weiter prüfen
								let nextParserPrev = null
								parserPrev.some(function (aParser) {
									if (!(aParser.options.get('tag.anywhere.use') || aParser.options.get('tag.possibleTag.use'))) {		// Wenn vorhergehender Parser weder "anywhere" noch "possibleTag" ist
										nextParserPrev = aParser
										return true
									}
								}, this)
								editorPrev.some(function (aEditor) {
									if (!(aEditor.parserObj && (aEditor.parserObj.options.get('tag.anywhere.use') || aEditor.parserObj.options.get('tag.possibleTag.use')))) {		// Wenn vorhergehender Parser weder "anywhere" noch "possibleTag" ist
										if (aEditor.parserObj !== nextParserPrev) {
											if (nextParserPrev) {
												errors.push('Position: Tag "' + nextParserPrev.name + '" sollte vorher stehen! (vpe)')
											} else {
												errors.push('Position: Tag sollte am Anfang stehen!')
											}
											return true
										}
									}
								}, this)
							}
						}
					}
				}
			}
		}
		// ToDo: if-Abfrage!
		return errors
	},
	checkValue: function (xmlObj) {
		let errors = []
		let ignoreChilds = false
		let aValOption = this.options.get('value')
		if (aValOption) {
			ignoreChilds = true
			// ToDo!
			console.log('>>>> checkValue', aValOption, xmlObj.getValueByOption(aValOption))
			console.log('>>>>>>> getChildsOfType', xmlObj.getChildsOfType(['text']))
		}
		return {'err': errors, 'ignoreChilds': ignoreChilds}
	},
	checkAttributes: function (attrObjX) {
		let errors = []
		let attrObj = ((Object.keys(attrObjX).length > 0) ? attrObjX : null)
		let aParAttrObj = this.options.get('attributes')
		aParAttrObj = ((aParAttrObj && Object.keys(aParAttrObj).length > 0) ? aParAttrObj : null)
		if (attrObj && aParAttrObj) {		// Attribute testen
			// Überprüfen ob Attribute fehlen
			Object.keys(aParAttrObj).some(function (aKey) {
				// ToDo: Eventuelle If-Abfrage verarbeiten
				if (!(aParAttrObj[aKey].canBeEmpty && aParAttrObj[aKey].canBeEmpty.use)
				&& !attrObj.hasOwnProperty(aKey)) {
					errors.push({'err': 'Attribut "' + aKey + '" fehlt!'})
				}
			}, this)
			// Vorhandene Attribute überprüfen
			Object.keys(attrObj).forEach(function (aKey) {
				let aErr = this.checkAttribute(aKey, attrObj[aKey])
				if (aErr) { errors.push(aErr) }
			}, this)
		} else if (attrObj && !aParAttrObj) {		// Keine Attribute
			errors.push({'err': 'Keine Attribute erwartet!'})
		} else if (!attrObj && aParAttrObj) {		// Überprüfen ob alle Attribute optional sind
			Object.keys(aParAttrObj).some(function (aKey) {
				// ToDo: Eventuelle If-Abfrage verarbeiten
				if (!(aParAttrObj[aKey].canBeEmpty && aParAttrObj[aKey].canBeEmpty.use)) {
					errors.push({'err': 'Attribute erwartet!'})
					return true
				}
			}, this)
		}
		return errors
	},
	checkAttribute: function (attr, val) {
		let aParAttrObj = this.options.get('attributes.' + attr)
		if (!aParAttrObj) {
			return 'Attribut "' + attr + '" nicht erwartet'
		}
		// ToDo: Eventuelle If-Abfrage verarbeiten
		if (aParAttrObj.type === 'fixed' && val !== aParAttrObj.value) {
			return 'Attribut "' + attr + '" hat nicht den erwateten Wert!'
		}
		if (!aParAttrObj.canBeEmpty && (val === undefined || val.length === 0)) {
			return 'Wert von Attribut "' + attr + '" darf nicht leer sein!'
		}
		if (aParAttrObj.type === 'variable') {
			if (aParAttrObj.possibleValues && aParAttrObj.possibleValues.use) {
				if (val && aParAttrObj.possibleValues.indexOf(val) < 0) {
					return 'Wert "' + val + '" von Attribut "' + attr + '" nicht in der Liste möglicher Werte!'
				}
			}
		}
	},
}

export default localFunctions
