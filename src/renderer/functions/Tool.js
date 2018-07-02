/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

export default {
	objParserUpdate: function (srcObj, objParser) {
		var pObj = srcObj
		var parserContent = getFirstTagObjByName('objPaserContent', objParser).c
		// console.log(JSON.parse(JSON.stringify(parserContent)))
		function parse(obj, parser) {
			var pPos = 0
			obj.forEach(function (v) {
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
						if (parser[pPos].n !== v.n) {
							if (parser[pPos - 1] && parser[pPos - 1].o && parser[pPos - 1].o.tag && parser[pPos - 1].o.tag.indexOf('multibleSiblings') > -1 && parser[pPos - 1].n === v.n) {
								pPos -= 1
							} else {
								addErrorToObj(v, 'Unerwarteter Tag!')
								pOn = false
							}
						}
					}
					if (pOn) {
						if (parser[pPos].a !== undefined && v.a === undefined) {
							addErrorToObj(v, 'Keine Attribute erwartet!')
						}
						if (parser[pPos].a === undefined && v.a !== undefined) {
							addErrorToObj(v, 'Attribute fehlen!')
						}
						if (parser[pPos].a !== undefined && v.a !== undefined && !equalObj(Object.keys(parser[pPos].a), Object.keys(v.a))) {
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
				if (Array.isArray(v.c)) {
					parse(v.c, ((parser && parser[pPos] && parser[pPos].c) ? parser[pPos].c : undefined))
				}
				pPos += 1
			}, this)
			return obj
		}
		// console.log('parse ...')
		return parse(pObj, parserContent)
	},
	obj2xmlString: function (srcObj) {
		function obj2xmlString (obj, deep = 0) {
			var out = ''
			obj.forEach(function (v) {
				if (v.n === '#text') {
					out += '	'.repeat(deep) + v.v + '\n'
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
		for (var i = 0; i < x.length ;i++) {
			var y = x[i]
			if (y.nodeType === y.TEXT_NODE) {
				if (error) {
					txt += y.nodeValue + '\n'
				}
			} else {
				if (y.childNodes[0] != undefined) {
					txt += this.xmlDomCheck(y, error || y.nodeName === 'parsererror')
				}
			}
		}
		return txt
	},
	xmlDom2Obj: function (xmlDom, parser = false) {
		function xml2Obj(xml) {
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
							for(var i = 0; i < v.attributes.length; i++) {
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
					} else if (v.nodeType === v.TEXT_NODE) {
						if (typeof v.nodeValue === "string") {
							var nVal = v.nodeValue.trim()
							if (nVal.length > 0) {
								if (val === undefined && obj.length === 0) {
									val = nVal
								} else {
									obj.push({n: '#text', v: nVal})
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

function getFirstTagObjByName(name, array) {
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
function addErrorToObj(obj, error) {
	if (obj.e === undefined) {
		obj.e = []
	}
	obj.e.push(error)
}
function equalObj(aList, bList) {
	return JSON.stringify(aList) === JSON.stringify(bList)
}
