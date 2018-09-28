import xmlFunctions from '@/functions/XmlFunctions'
import Parser from '../Parser'
import FxGeoSelect from './FxGeoSelect'
const XLSX = require('xlsx')
const path = require('path')

const localFunctions = {
	init (xmlString, aFile) {
		// "xmlString" überprüfen und auf "this.orgString" setzen
		if (typeof xmlString !== 'string') {		// Prüfen ob der übergebene Wert ein String ist
			this.addError('init() - Übergebener Wert ist kein "string"!')
			return false
		} else if (xmlString.trim().length < 20) {
			this.orgString = null
			this.addError('init() - Übergebener Wert ist viel zu klein!')
			return false
		}
		this.orgString = xmlString.trim()
		this.orgFilename = aFile
		if (this.orgFilename) {
			this.orgPath = this.orgFilename.substr(0, this.orgFilename.length - this.orgFilename.split('\\').pop().split('/').pop().length)
		}
		// "this.orgString" in DOM Objekt umwanden, überprüfen und in "this.orgDOM" setzen
		this.orgDOM = new DOMParser().parseFromString(this.orgString, 'application/xml')
		var xmlStringError = xmlFunctions.xmlDomCheck(this.orgDOM)		// Prüfen ob es Fehler gab
		if (xmlStringError.length > 0) {
			this.orgDOM = null
			this.addError({'txt': 'Beim verarbeiten der XML ist es zu einen Fehler gekommen!', 'sErr': xmlStringError})
			return false
		}
		// "this.orgDOM" verarbeiten und in "ParserObject"e umwandeln
		this.prescan(this.orgDOM)		// Prescan für "optionsPreset"
		// Eigentliche "ParserObject"e
		if (this.orgDOM.childNodes.length > 0) {
			this.orgDOM.childNodes.forEach(function (topChild) {
				if (topChild.nodeType === topChild.ELEMENT_NODE && topChild.nodeName === 'objParser') {
					if (topChild.childNodes.length > 0) {
						topChild.childNodes.forEach(function (parserChild) {
							if (parserChild.nodeType === parserChild.ELEMENT_NODE) {
								if (parserChild.nodeName === 'xmlParserHeader') {		// "this.header" setzen
									this.header = parserChild.textContent.trim()
								} else if (parserChild.nodeName === 'objParserContent') {		// "this.content" setzen
									if (parserChild.childNodes.length > 0) {
										parserChild.childNodes.forEach(function (contentChild) {
											if (contentChild.nodeType === contentChild.ELEMENT_NODE
											|| (contentChild.nodeType === contentChild.PROCESSING_INSTRUCTION_NODE && contentChild.nodeName === 'copy')) {
												this.content.push(new Parser.ParserObject(this, null, contentChild))
											}
										}, this)
									}
								} else if (parserChild.nodeName === 'objParserSystem') {		// "this.system" setzen
									if (parserChild.childNodes.length > 0) {
										parserChild.childNodes.forEach(function (systemChild) {
											if (systemChild.nodeType === systemChild.ELEMENT_NODE
											|| (systemChild.nodeType === systemChild.PROCESSING_INSTRUCTION_NODE && systemChild.nodeName === 'copy')) {
												this.system.push(new Parser.ParserObject(this, null, systemChild))
											}
										}, this)
									}
								} else if (parserChild.nodeName === 'objParserPreview') {		// "this.preview" setzen
									if (parserChild.childNodes.length > 0) {
										parserChild.childNodes.forEach(function (previewChild) {
											if (previewChild.nodeType === previewChild.ELEMENT_NODE
											|| (previewChild.nodeType === previewChild.PROCESSING_INSTRUCTION_NODE)) {
												console.log(previewChild)
												// this.system.push(new Parser.ParserPreviewObject(this, null, previewChild))
											}
										}, this)
									}
								}
							}
						}, this)
					}
				}
			}, this)
		}
		if (this.content.length === 0) {
			this.addError('Es wurde kein "objParserContent" gefunden!')
			return false
		}
		// "copy"-Objekte befüllen
		this.family.forEach(function (aObj) {
			if (aObj && aObj.isCopy) {
				aObj.makeCopy()
			}
		})
		// "additionalFiles" ermitteln und laden
		if (this.orgPath) {
			this.family.forEach(function (aObj) {
				if (aObj && aObj.options && aObj.options.get('editor.fxFunction.filename')) {
					let lFile = aObj.options.get('editor.fxFunction.filename')
					// Datei laden falls noch nicht vorhanden.
					if (!this.additionalFiles[lFile]) {
						let fContent = {}
						fContent.fullFileName = path.join(this.orgPath, lFile)
						fContent.ext = lFile.split('.').pop()
						if (fContent.ext === 'xlsx' || fContent.ext === 'xls') {
							try {
								// let t0 = performance.now()
								fContent.XLSX = XLSX.readFile(fContent.fullFileName)
								// let t1 = performance.now()
								fContent.JSON = XLSX.utils.sheet_to_json(fContent.XLSX.Sheets[fContent.XLSX.SheetNames[0]])
								// console.log('XLSX laden: ' + Math.ceil(t1 - t0) + ' ms. > JSON: ' + Math.ceil(performance.now() - t1) + ' ms.')
							} catch (e) {
								this.addError('Datei "' + fContent.fullFileName + '" konnte nicht geladen werden! (xlsx)')
								console.log(e)
							}
						}
						this.additionalFiles[lFile] = fContent
					}
					// Datenvorbereitung für spezielle Funktionen:
					if (!this.additionalFiles[lFile].geoSelect && this.additionalFiles[lFile].JSON && aObj.options.get('editor.fxFunction.name') === 'GeoSelect') {		// Daten für GeoSelect vorbereiten
						this.additionalFiles[lFile].geoSelect = FxGeoSelect.fileData(this, lFile)
						// console.log(this.additionalFiles[lFile].JSON.length, this.additionalFiles[lFile].geoSelect['Kleinregion'].length + this.additionalFiles[lFile].geoSelect['Großregion'].length + this.additionalFiles[lFile].geoSelect['Bundesland'].length, this.additionalFiles[lFile].JSON, this.additionalFiles[lFile].geoSelect)
					}
				}
			}, this)
			// console.log(this.additionalFiles)
		} else {
			this.addError('Das Verzeichniss des Parsers konnte nicht ermittelt werden!')
		}
		this.ready = true
		if (Object.keys(this.errors).length > 0) {
			return false
		}
		this.useable = true
		return true
	},
	prescan (aDom) {
		if (aDom.nodeType === aDom.PROCESSING_INSTRUCTION_NODE && aDom.nodeName === 'optionsPreset') {
			let aOptions
			try {
				aOptions = JSON.parse(aDom.nodeValue)
			} catch (err) {
				console.log(err)
				let errArr = [err.toString()]
				let errRange = errArr[0].match(/position (\d+)/mi)
				if (errRange.length > 1) {
					errArr.push('Fehlerbereich: ' + ((errRange[1] > 20) ? '...' : '') + this.orgDOM.nodeValue.substr(((errRange[1] > 20) ? errRange[1] - 20 : 0), 40).trim() + '...')
				}
				this.addError({'txt': 'Fehler im JSON-String! (text)', 'err': errArr})
			}
			if (!aOptions.id) {
				this.addError({'txt': 'Fehler in "optionsPreset": Keine ID übergeben!'})
			} else if (this.idOptions[aOptions.id]) {
				this.addError({'txt': 'Fehler in "optionsPreset": ID doppelt vergeben!'})
			} else {
				let aId = aOptions.id
				delete aOptions.id
				this.idOptions[aId] = new Parser.ParserOptions()
				this.idOptions[aId].extendJSON(JSON.stringify(aOptions), this)
			}
		} else if (aDom.childNodes.length > 0) {
			aDom.childNodes.forEach(function (child) {
				this.prescan(child)
			}, this)
		}
	}
}

export default localFunctions
