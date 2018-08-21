const localFunctions = {
	htmlEncode (html) {		// HTML-Sonderzeichen schützen
		return document.createElement('a').appendChild(document.createTextNode(html)).parentNode.innerHTML
	},
	hasSubProp (obj, propertys, retVal = false) {		// Ermitten ob Property in einem verschachtelten Objekt existiert
		var out = false
		if ((typeof propertys === 'string') && (propertys !== null) && propertys.length > 0) {
			var aObj = obj
			propertys.split('.').some(function (property) {
				if ((typeof aObj === 'object') && (aObj !== null)) {
					if (aObj.hasOwnProperty(property)) {
						out = true
						aObj = aObj[property]
					} else {
						out = false
						return true
					}
				} else {
					out = false
					return true
				}
			})
		}
		return ((retVal) ? ((out) ? aObj : null) : out)
	},
	getValOfSubProp (obj, propertys) {		// Gibt Wert eines Property eines verschachtelten Objekts zurück
		return localFunctions.hasSubProp(obj, propertys, true)
	},
	isValInArrOfSubProp (obj, propertys, value) {		// Ist Wert in Array eines verschachtelten Objekts vorhanden
		var aObj = localFunctions.getValOfSubProp(obj, propertys)
		if (Array.isArray(aObj)) {
			return (aObj.indexOf(value) > -1)
		} else {
			return null
		}
	},
	getFirstKeyOfValueInPropertyOfArray (arr, property, value) {
		let rKey = -1
		if (Array.isArray(arr)) {
			arr.some(function (aVal, aKey) {
				if (aVal[property] && aVal[property] === value) {
					rKey = aKey
					return true
				}
			}, this)
		}
		return rKey
	},
	getFirstObjectOfValueInPropertyOfArray (arr, property, value, returnObj) {
		let rObj = ((returnObj) ? {} : null)
		if (Array.isArray(arr)) {
			arr.some(function (aVal, aKey) {
				if (aVal[property] && aVal[property] === value) {
					rObj = aVal
					return true
				}
			}, this)
		}
		return rObj
	},
}

export default localFunctions
