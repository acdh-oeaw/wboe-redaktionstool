// import xmlFunctions from '@/functions/XmlFunctions'
// import stdFunctions from '@/functions/stdFunctions'
import Parser from '../Parser'

function domDescendantsPIN (dom) {
	let hasPIN = false
	if (dom.childNodes && dom.childNodes.length > 0) {
		dom.childNodes.forEach(function (aChild) {
			if (aChild.nodeType === aChild.PROCESSING_INSTRUCTION_NODE || domDescendantsPIN(aChild)) {
				hasPIN = true
			}
		}, this)
	}
	return hasPIN
}

function attributesToText (attr) {
	let attrTxt = ''
	if (attr.length > 0) {
		for (var i = 0; i < attr.length; i++) {
			attrTxt += ' ' + attr[i].nodeName + '="' + attr[i].nodeValue + '"'
		}
	}
	return attrTxt
}

const localFunctions = {
	init () {
		// console.log(this.orgDOM)
		if (this.orgDOM.nodeType === this.orgDOM.PROCESSING_INSTRUCTION_NODE) {
			console.log('xxx')
		} else {
			if (domDescendantsPIN(this.orgDOM)) {
				this.content.push('<' + this.orgDOM.nodeName + attributesToText(this.orgDOM.attributes) + '>')
				if (this.orgDOM.childNodes.length > 0) {
					this.orgDOM.childNodes.forEach(function (previewChild) {
						let aHTML = previewChild.outerHTML
						if (previewChild.nodeType === previewChild.TEXT_NODE) {
							aHTML = previewChild.nodeValue
						}
						if (previewChild.nodeType === previewChild.PROCESSING_INSTRUCTION_NODE || domDescendantsPIN(previewChild)) {
							this.content.push(new Parser.ParserPreviewObject(previewChild))
						} else if ((aHTML && aHTML.trim().length > 0)) {
							let lPos = this.content.length - 1
							if (lPos >= 0 && typeof this.content[lPos] === 'string') {
								this.content[lPos] += ' ' + aHTML.trim()
							} else {
								this.content.push(aHTML.trim())
							}
						}
					}, this)
				}
				let aHTML = '</' + this.orgDOM.nodeName + '>'
				let lPos = this.content.length - 1
				if (lPos >= 0 && typeof this.content[lPos] === 'string') {
					this.content[lPos] += ' ' + aHTML
				} else {
					this.content.push(aHTML)
				}
			} else {
				let aHTML = this.orgDOM.outerHTML
				if (this.orgDOM.nodeType === this.orgDOM.TEXT_NODE) {
					aHTML = this.orgDOM.nodeValue
				}
				if (aHTML && aHTML.trim().length > 0) {
					this.content.push(aHTML.trim())
				}
			}
		}
		this.ready = true
		this.useable = true
		return true
	},
}

export default localFunctions
