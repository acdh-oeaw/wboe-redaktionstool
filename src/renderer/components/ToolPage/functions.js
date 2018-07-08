export default {
	objParserUpdate: function (srcObj, objParser) {		// Struktur des Objekts überprüfen
		var pObj = srcObj
		function parse (obj, parser) {
			var pPos = 0
			var addEmptyObj = []
			obj.forEach(function (v, k) {
				if (v.n !== '#comment') {
					if (parser) {
						var pOn = true
						if (!parser[pPos]) {
							if (parser[pPos - 1] && parser[pPos - 1].o && parser[pPos - 1].o.tag && parser[pPos - 1].o.tag.indexOf('multibleSiblings') > -1) {
								pPos -= 1
							} else {
								addErrorToObj(v, 'Zeile stimmt nicht mit "Parser" Struktur überein!')
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
									addErrorToObj(v, 'Unerwarteter Tag!')
									pOn = false
								}
							}
						}
						if (pOn) {
							if (parser[pPos].a !== undefined && v.a === undefined
									&& parser[pPos].a !== undefined && v.a !== undefined && !equalObj(Object.keys(parser[pPos].a), Object.keys(v.a))) {
								addErrorToObj(v, 'Keine Attribute erwartet!')
							}
							if (parser[pPos].a === undefined && v.a !== undefined) {
								addErrorToObj(v, 'Attribute fehlen!')
							}
							if (!(parser[pPos].o && parser[pPos].o.attribut && (parser[pPos].o.attribut.indexOf('edit') > -1 || parser[pPos].o.attribut.indexOf('variable') > -1))
									&& parser[pPos].a !== undefined && v.a !== undefined && !equalObj(Object.keys(parser[pPos].a), Object.keys(v.a))) {
								addErrorToObj(v, 'Unerwartete Attribute!')
							} else if (!(parser[pPos].o && parser[pPos].o.attribut && (parser[pPos].o.attribut.indexOf('edit') > -1 || parser[pPos].o.attribut.indexOf('variable') > -1))
											&& (parser[pPos].a !== undefined && v.a !== undefined && !equalObj(parser[pPos].a, v.a))) {
								addErrorToObj(v, 'Unerwartete Attribut Werte!')
							}
							if (!(parser[pPos].o && parser[pPos].o.value && (parser[pPos].o.value.indexOf('edit') > -1 || parser[pPos].o.value.indexOf('variable') > -1))
								&& (parser[pPos].v !== v.v)) {
								addErrorToObj(v, 'Unerwartete Tag Wert!')
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
						addErrorToObj(v, 'Kein "Parser" übergeben!')
					}
					if (Array.isArray(v.c)) {		// Kinder überprüfen
						parse(v.c, ((parser && parser[pPos] && parser[pPos].c) ? parser[pPos].c : undefined))
					}
					pPos += 1
				}
			}, this)
			if (parser) {
				while (pPos < parser.length) {		// Weitere Parser Objekte hinzufügen!
					let aKey = obj.push(parser[pPos]) - 1
					if (!(obj[aKey] && obj[aKey].o && obj[aKey].o.tag && obj[aKey].o.tag.indexOf('canBeEmpty') > -1)) {
						addErrorToObj(obj[aKey], 'Fehlender Tag!')
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
			return obj
		}
		return parse(pObj, getFirstTagObjByName('objPaserContent', objParser).c)
	},
	obj2xmlString: function (srcObj) {
		function obj2xmlString (obj, deep = 0) {
			// ToDo: canBeEmpty mit Kindern beachten!
			var out = ''
			obj.forEach(function (v) {
				if (v.n === '#text') {
					if (v.v !== undefined) {
						out += '	'.repeat(deep) + v.v + '\n'
					}
				} else if (v.n === '#comment') {
					out += '	'.repeat(deep) + '<!-- ' + v.v + ' -->\n'
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
						out += '\n' + obj2xmlString(v.c, deep + 1) + '	'.repeat(deep)
					}
					out += '</' + v.n + '>\n'
				}
			}, this)
			return out
		}
		if (srcObj && srcObj.c) {
			var nXmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml" schematypens="http://purl.oclc.org/dsdl/schematron"?>\n<?xml-model href="../803_RNG-schematron/WBOE-ODD.rnc" type="application/relax-ng-compact-syntax"?>\n'
			nXmlString += obj2xmlString(srcObj.c)
			return nXmlString
		} else {
			return undefined
		}
	},
	xmlString2xmlDom: function (xmlString) {
		var xmlDom = new DOMParser().parseFromString(xmlString, 'application/xml')
		this.xmlStringError = this.xmlDomCheck(xmlDom)
		if (this.xmlStringError.length > 0) {
			// ToDo: Fehlermeldung auslagern!
			alert('Beim verarbeiten der XML ist es zu einen Fehler gekommen:\n\n' + this.xmlStringError)
			return {xmlDom: undefined, error: this.xmlStringError}
		}
		return {xmlDom: xmlDom, error: undefined}
	},
	xmlDomCheck: function (xmlDom, error = false) {
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
	xmlDom2Obj: function (xmlDom, parser = false) {
		function xml2Obj (xml) {
			var obj = []
			var val = undefined
			if (xml.childNodes.length > 0) {
				xml.childNodes.forEach(function (v) {
					if (v.nodeType === v.ELEMENT_NODE) {
						if (val !== undefined) {
							obj.push({n: '#text', v: val})
							val = undefined
						}
						var aObj = {}
						aObj.n = v.nodeName
						if (v.attributes.length > 0) {
							for (var i = 0; i < v.attributes.length; i++) {
								var a = v.attributes[i]
								if (a.nodeName.substring(0, 9) === 'objParser') {
									if (parser) {
										if (aObj.o === undefined) {
											aObj.o = {}
										}
										var aParserOptionName = a.nodeName.substring(9).charAt(0).toLowerCase() + a.nodeName.substring(9).slice(1)
										if (['title', 'tagAddTitle'].indexOf(aParserOptionName)) {
											aObj.o[aParserOptionName] = a.nodeValue
										} else {
											aObj.o[aParserOptionName] = a.nodeValue.split(' ')
										}
										if (aParserOptionName === 'text' && a.nodeValue === 'text') {
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
						if (v.childNodes.length > 0) {
							var cN = xml2Obj(v)
							if (cN[0].length > 0) {
								aObj.c = cN[0]
							}
							if (cN[1] !== undefined) {
								aObj.v = cN[1]
							}
						}
						obj.push(aObj)
					} else if (v.nodeType === v.TEXT_NODE || (v.nodeType === v.COMMENT_NODE && !parser)) {
						if (typeof v.nodeValue === 'string') {
							var nVal = v.nodeValue.trim()
							if (nVal.length > 0) {
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

function getFirstTagObjByName (name, array) {
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
function addErrorToObj (obj, error) {
	if (obj.e === undefined) {
		obj.e = []
	}
	obj.e.push(error)
}
function equalObj (aList, bList) {
	return JSON.stringify(aList) === JSON.stringify(bList)
}
