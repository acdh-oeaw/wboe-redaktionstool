import xmlFunctions from '@/functions/XmlFunctions'
import stdFunctions from '@/functions/stdFunctions'
// import Parser from '../Parser'

const localFunctions = {
	init () {
		this.options = {
			'tagAsTitle': true
		}
		this.options = this.decompressOptions(this.options)
		this.ready = true
		this.useable = true
		return true
	},
	get (opt) {
		return stdFunctions.getValOfSubProp(this.options, opt)
	},
	getResult (opt) {
		let aOpt = stdFunctions.getValOfSubProp(this.options, opt)
		let optName = opt.split('.')
		optName = optName[optName.length - 1]
		if (aOpt && typeof aOpt !== 'string') {
			if (optName === 'title') {
				if (!aOpt.use) {
					return null
				} else {
					return aOpt.value
				}
			} else {
				console.log('getResult', 'Unbekannte Option!', optName, aOpt)
				return JSON.stringify(aOpt)
			}
		}
		return aOpt
	},
	decompressOptions: xmlFunctions.decompressProcessingOptions,
	initFromParserObject (pObj) {
		// Atribute auswerten
		if (Object.keys(pObj.attributes).length > 0) {
			Object.keys(pObj.attributes).forEach(function (aKey) {
				if (!this.options.attributes) { this.options.attributes = {} }
				this.options.attributes[aKey] = {'value': pObj.attributes[aKey], 'type': 'fixed'}
			}, this)
		}
		return true
	},
	extendJSON (jsonString, errObj) {
		try {
			return this.extendObj(this.decompressOptions(JSON.parse(jsonString)))
		} catch (err) {
			console.log(err)
			if (errObj) {
				let errArr = [err.toString()]
				let errRange = errArr[0].match(/position (\d+)/mi)
				if (errRange.length > 1) {
					errArr.push('Fehlerbereich: ' + ((errRange[1] > 20) ? '...' : '') + jsonString.substr(((errRange[1] > 20) ? errRange[1] - 20 : 0), 40).trim() + '...')
				}
				errObj.addError({'txt': 'Fehler im JSON-String! (extendJSON)', 'err': errArr})
			}
			return null
		}
	},
	extendObj (optionObj) {
		this.options = this.combineObj(this.options, optionObj)
		return true
	},
	combineObj: xmlFunctions.combineProcessingOptions,
}

export default localFunctions
