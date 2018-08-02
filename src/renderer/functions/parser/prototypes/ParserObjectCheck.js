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
				} else {
					// errors.push('Position: test')
					console.log('parserPrev >>>', parserPrev, this.name)
					console.log('editorObj >>>', editorPrev, xmlObj.name)
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
