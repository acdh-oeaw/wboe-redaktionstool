import Vue from 'vue'

export default {
	objParserUpdate: function (srcObj, objParser, structureError = false) {		// Struktur des Objekts überprüfen
		var pObj = srcObj
		var errors = []
		function parse (obj, parser) {
			var pPos = 0
			var addEmptyObj = []
			var lastNodeObj = undefined
			obj.forEach(function (v, k) {
				var tagError = false
				delete v.commented
				if (v.n === '#comment') {
					if (lastNodeObj !== undefined && obj[lastNodeObj] !== undefined) {
						if (obj[lastNodeObj].commented === undefined) {
							obj[lastNodeObj].commented = []
						}
						obj[lastNodeObj].commented.push(k)
						v.commented = true
					}
				} else {
					if (parser) {
						var pOn = true
						if (!parser[pPos]) {
							if (parser[pPos - 1] && parser[pPos - 1].o && parser[pPos - 1].o.tag && parser[pPos - 1].o.tag.indexOf('multibleSiblings') > -1) {
								pPos -= 1
							} else {
								errors.push(addErrorToObj(v, 'Zeile stimmt nicht mit "Parser" Struktur überein!'))
								tagError = true
								pOn = false
							}
						}
						if (pOn) {
							if (parser[pPos].n !== v.n) {		// Überprüfen ob ein potentiell leeres Tag vorhanden ist (canBeEmpty)
								let xPos = pPos
								let addEmptyObjInTag = []
								while (xPos <= parser.length
									&& parser[xPos]
									&& parser[xPos].o
									&& parser[xPos].o.tag
									&& parser[xPos].o.tag.indexOf('canBeEmpty') > -1
									&& parser[xPos].n !== v.n
								) {
									addEmptyObjInTag.push(parser[xPos])
									xPos += 1
								}
								pPos = xPos
								if (addEmptyObjInTag.length > 0) {
									addEmptyObj.push({pos: k, tags: addEmptyObjInTag})
								}
							}
							if (parser[pPos].n !== v.n) {		// Überprüfen ob es sich um ein "multibleSiblings" handelt
								if (parser[pPos - 1] && parser[pPos - 1].o && parser[pPos - 1].o.tag && parser[pPos - 1].o.tag.indexOf('multibleSiblings') > -1 && parser[pPos - 1].n === v.n) {
									pPos -= 1
								} else {
									errors.push(addErrorToObj(v, 'Unerwarteter Tag!'))
									tagError = true
									pOn = false
								}
							}
						}
						if (pOn) {
							if (parser[pPos].a !== undefined && v.a === undefined
									&& parser[pPos].a !== undefined && v.a !== undefined && !equalObj(Object.keys(parser[pPos].a), Object.keys(v.a))) {
								errors.push(addErrorToObj(v, 'Keine Attribute erwartet!'))
								pOn = false
							}
							if (parser[pPos].a === undefined && v.a !== undefined) {
								errors.push(addErrorToObj(v, 'Attribute fehlen!'))
								pOn = false
							}
							if (!(parser[pPos].o && parser[pPos].o.attribut && (parser[pPos].o.attribut.indexOf('edit') > -1 || parser[pPos].o.attribut.indexOf('variable') > -1))
									&& parser[pPos].a !== undefined && v.a !== undefined && !equalObj(Object.keys(parser[pPos].a), Object.keys(v.a))) {
								errors.push(addErrorToObj(v, 'Unerwartete Attribute!'))
								pOn = false
							} else if (!(parser[pPos].o && parser[pPos].o.attribut && (parser[pPos].o.attribut.indexOf('edit') > -1 || parser[pPos].o.attribut.indexOf('variable') > -1))
											&& (parser[pPos].a !== undefined && v.a !== undefined && !equalObj(parser[pPos].a, v.a))) {
								errors.push(addErrorToObj(v, 'Unerwartete Attribut Werte!'))
								pOn = false
							}
							if (!(parser[pPos].o && parser[pPos].o.value && (parser[pPos].o.value.indexOf('edit') > -1 || parser[pPos].o.value.indexOf('variable') > -1))
								&& (parser[pPos].v !== v.v)) {
								errors.push(addErrorToObj(v, 'Unerwarteter Tag Wert!'))
								pOn = false
							}
							if (!Array.isArray(v.e) && parser[pPos].o) {
								v.o = parser[pPos].o
								if (parser[pPos].o.tag && parser[pPos].o.tag.indexOf('multibleSiblings') > -1) {
									v.add = parser[pPos]
									v.add.add = v.add
								}
							}
						}
					} else {
						errors.push(addErrorToObj(v, 'Kein "Parser" übergeben!'))
						structureError = true
					}
					lastNodeObj = k
					if (tagError || !pOn) {
						structureError = true
					}
					if (Array.isArray(v.c)) {		// Kinder überprüfen
						let childParse = parse(v.c, ((parser && parser[pPos] && parser[pPos].c) ? parser[pPos].c : undefined), structureError)
						errors.concat(childParse.errors)
						if (childParse.structureError) {
							structureError = true
						}
					} else if (parser && parser[pPos] && parser[pPos].c) {
						parser[pPos].c.some(function (pV) {
							if (!(pV.o && pV.o.tag && pV.o.tag.indexOf('canBeEmpty') > -1)) {
								structureError = true
								tagError = true
								errors.push(addErrorToObj(v, 'Erwartete "Kinder" nicht vorhanden!'))
								return true
							}
						})
					}
					if (!tagError) {
						pPos += 1
					}
				}
			}, this)
			if (!structureError) {
				while (pPos < parser.length) {		// Weitere Parser Objekte hinzufügen!
					let aKey = obj.push(parser[pPos]) - 1
					if (!(obj[aKey] && obj[aKey].o && obj[aKey].o.tag && obj[aKey].o.tag.indexOf('canBeEmpty') > -1)) {
						errors.push(addErrorToObj(obj[aKey], 'Fehlender Tag!'))
					}
					pPos += 1
				}
				if (addEmptyObj.length > 0) {		// Leere Objecte hinzufügen (canBeEmpty)
					addEmptyObj = addEmptyObj.slice().sort((a, b) => {
						if (a.pos < b.pos) { return 1 }
						if (a.pos > b.pos) { return -1 }
						return 0
					})
					addEmptyObj.forEach(function (aeo) {
						obj.splice(aeo.pos, 0, ...aeo.tags)
					})
				}
			}
			return {'obj': obj, 'structureError': structureError, 'errors': errors}
		}
		var parsed = parse(pObj, getFirstTagObjByName('objParserContent', objParser).c)
		return parsed
	},
	obj2xmlString: function (srcObj) {		// Objekt in XML-String umwandeln
		function fObj2xmlString (obj, deep = 0, aLine = 0) {
			// ToDo: canBeEmpty mit Kindern beachten!
			var out = ''
			obj.forEach(function (v) {
				Vue.set(v, 'line', aLine)
				if (v.n === '#text') {
					if (v.v !== undefined) {
						out += '	'.repeat(deep) + v.v + '\n'
						aLine += 1
					}
				} else if (v.n === '#comment') {
					if (v.v !== undefined) {
						out += '	'.repeat(deep) + '<!-- ' + v.v + ' -->\n'
						aLine += 1
					}
				} else {
					out += '	'.repeat(deep) + '<' + v.n
					if (v.a) {
						Object.keys(v.a).map(function (aK) {
							out += ' ' + aK + ((v.a[aK] === undefined) ? '' : '="' + v.a[aK] + '"')
						}, this)
					}
					out += '>'
					if (v.v) {
						out += v.v
					}
					if (Array.isArray(v.c)) {
						aLine += 1
						let cOut = fObj2xmlString(v.c, deep + 1, aLine)
						aLine = cOut.aLine
						out += '\n' + cOut.out + '	'.repeat(deep)
					}
					out += '</' + v.n + '>\n'
					aLine += 1
				}
			}, this)
			return {'out': out, 'aLine': aLine}
		}
		if (srcObj && srcObj.c) {
			// ToDo: xmlParserHeader verwenden
			var nXmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml" schematypens="http://purl.oclc.org/dsdl/schematron"?>\n<?xml-model href="../803_RNG-schematron/WBOE-ODD.rnc" type="application/relax-ng-compact-syntax"?>\n'
			var aLine = nXmlString.split(/\r\n|\r|\n/).length
			nXmlString += fObj2xmlString(srcObj.c, 0, ((aLine > 0) ? aLine : 1)).out
			return nXmlString
		} else {
			return undefined
		}
	},
	xmlString2xmlDom: function (xmlString) {		// xmlString in DOM-Objekt umwandeln
		var xmlDom = new DOMParser().parseFromString(xmlString, 'application/xml')
		this.xmlStringError = this.xmlDomCheck(xmlDom)
		if (this.xmlStringError.length > 0) {
			// ToDo: Fehlermeldung auslagern!
			alert('Beim verarbeiten der XML ist es zu einen Fehler gekommen:\n\n' + this.xmlStringError)
			return {xmlDom: undefined, error: this.xmlStringError}
		}
		return {xmlDom: xmlDom, error: undefined}
	},
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
					txt += this.xmlDomCheck(y, error || y.nodeName === 'parsererror')
				}
			}
		}
		return txt
	},
	xmlDom2Obj: function (xmlDom, parser = false) {		// DOM-Objekt in Objekt umwandeln
		function xml2Obj (xml) {
			var obj = []
			var val = undefined
			if (xml.childNodes.length > 0) {
				xml.childNodes.forEach(function (v) {
					if (v.nodeType === v.ELEMENT_NODE) {
						if (val !== undefined) {		// Sollte sich im Parent bereits ein Text-Wert befinden dieses in ein Objekt umwandeln um weitere Objekte hinzufügen zu können
							obj.push({n: '#text', v: val})
							val = undefined
						}
						var aObj = {}
						aObj.n = v.nodeName
						if (v.attributes.length > 0) {		// Attribute auswerten
							for (var i = 0; i < v.attributes.length; i++) {
								var a = v.attributes[i]
								if (a.nodeName.substring(0, 9) === 'objParser') {		// Handelt es sich um eine Parser option?
									if (parser) {		// Nur auswerten wenn es sich um eine Parser-XML handelt
										if (aObj.o === undefined) {
											aObj.o = {}
										}
										var aParserOptionName = a.nodeName.substring(9).charAt(0).toLowerCase() + a.nodeName.substring(9).slice(1)
										if (['title', 'tagAddTitle'].indexOf(aParserOptionName) > -1) {
											aObj.o[aParserOptionName] = a.nodeValue		// Option als String
										} else {
											aObj.o[aParserOptionName] = a.nodeValue.split(' ')		// Option als Array
										}
										if (aParserOptionName === 'text' && a.nodeValue === 'text') {		// Tag als Text-Wert behandeln
											aObj.n = '#text'
										}
									}
								} else {
									if (aObj.a === undefined) {
										aObj.a = {}
									}
									aObj.a[a.nodeName] = a.nodeValue
								}
							}
						}
						if (v.childNodes.length > 0) {		// Eventuell vorhandene Kinder auswerten
							var cN = xml2Obj(v)
							if (cN[0].length > 0) {
								aObj.c = cN[0]
							}
							if (cN[1] !== undefined) {
								aObj.v = cN[1]
							}
						}
						obj.push(aObj)
					} else if (v.nodeType === v.TEXT_NODE || (v.nodeType === v.COMMENT_NODE && !parser)) {		// Texte und Kommentare auswerten
						if (typeof v.nodeValue === 'string') {
							var nVal = v.nodeValue.trim()
							if (nVal.length > 0) {		// Nur Texte und Kommentare mit Inhalt verarbeiten
								if (v.nodeType !== v.COMMENT_NODE && val === undefined && obj.length === 0) {
									val = nVal
								} else {
									obj.push({n: ((v.nodeType === v.COMMENT_NODE) ? '#comment' : '#text'), v: nVal})
									val = undefined
								}
							}
						}
					}
				}, this)
			}
			return [obj, val]
		}
		return xml2Obj(xmlDom)[0]
	}
}

function getFirstTagObjByName (name, array) {		// Findet ersten Tag mit Namen "name" in Objekt
	var out = undefined
	array.some(function (val) {
		if (val.n === name) {
			out = val
			return true
		}
		if (Array.isArray(val.c)) {
			out = getFirstTagObjByName(name, val.c)
			if (out !== undefined) {
				return true
			}
		}
	}, this)
	return out
}
function addErrorToObj (obj, error) {		// Fehlermeldung Liste von Fehlermeldungen bei Objekt hinzufügen
	if (obj.e === undefined) {
		obj.e = []
	}
	obj.e.push({'error': error, 'obj': obj})
	return {'error': error, 'obj': obj}
}
function equalObj (aList, bList) {		// Vergleicht zwei Objekte/Arrays
	return JSON.stringify(aList) === JSON.stringify(bList)
}
