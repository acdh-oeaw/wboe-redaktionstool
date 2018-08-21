const localFunctions = {
	fileData (eObj, lFile) {
		// Einstellungen
		let pFields = ['Ort', 'Gemeinde', 'Kleinregion', 'Großregion', 'Bundesland']
		let pFieldStart = 2
		// Vorbereitungen
		let uFields = pFields.slice(pFieldStart)
		let geoSelect = { 'pFields': pFields, 'uFields': uFields }
		uFields.forEach(function (aField) {
			geoSelect[aField] = []
			geoSelect[aField + 'Obj'] = {}
		})
		eObj.additionalFiles[lFile].JSON.forEach(function (aLine, aLineNr) {
			if (aLine.Sigle_DB) {
				let aStartPos = 0
				while (!aLine[pFields[aStartPos]] && aStartPos < pFields.length) {
					aStartPos += 1
				}
				if (aStartPos < pFields.length && aStartPos >= pFieldStart) {
					let xFields = pFields.slice(aStartPos)
					let fHit = true
					xFields.forEach(function (aCol, aPos) {
						if (aLine[aCol]) {
							if (fHit) {
								let aField = { 'name': aLine[aCol], 'sigle': aLine.Sigle_DB, 'sort': aLineNr, 'parents': {} }
								if (!geoSelect[aCol + 'Obj'][aLine[aCol]]) {
									geoSelect[aCol + 'Obj'][aLine[aCol]] = { 'name': aLine[aCol] }
								}
								geoSelect[aCol + 'Obj'][aLine[aCol]].sigle = aLine.Sigle_DB
								aField.obj = geoSelect[aCol + 'Obj'][aLine[aCol]]
								if (aPos < xFields.length - 1) {
									xFields.slice(aPos + 1).forEach(function (xData) {
										if (!geoSelect[xData + 'Obj'][aLine[xData]]) {
											geoSelect[xData + 'Obj'][aLine[xData]] = { 'name': aLine[xData] }
										}
										aField.parents[xData] = geoSelect[xData + 'Obj'][aLine[xData]]
									})
								}
								geoSelect[aCol].push(aField)
								fHit = false
							}
						}
					})
				}
			}
		})
		return geoSelect
	},
}

export default localFunctions
