import xmlFunctions from '@/functions/XmlFunctions'
import stdFunctions from '@/functions/stdFunctions'
// import Parser from '../Parser'

const localFunctions = {
	init: function () {
		this.options = {
			'tagAsTitle': true
		}
		this.options = this.decompressOptions(this.options)
		this.ready = true
		this.usable = true
		return true
	},
	get: function (opt) {
		return stdFunctions.getValOfSubProp(this.options, opt)
	},
	decompressOptions: xmlFunctions.decompressProcessingOptions,
	initFromParserObject: function (pObj) {
		// Atribute auswerten
		if (Object.keys(pObj.attributes).length > 0) {
			Object.keys(pObj.attributes).forEach(function (aKey) {
				if (!this.options.attributes) { this.options.attributes = {} }
				this.options.attributes[aKey] = {'value': pObj.attributes[aKey], 'type': 'fixed'}
			}, this)
		}
		return true
	},
	extendJSON: function (jsonString) {
		return this.extendObj(this.decompressOptions(JSON.parse(jsonString)))
	},
	extendObj: function (optionObj) {
		this.options = this.combineObj(this.options, optionObj)
		return true
	},
	combineObj: xmlFunctions.combineProcessingOptions,
}

export default localFunctions
