// import xmlFunctions from '@/functions/XmlFunctions'
import Vue from 'vue'

const localFunctions = {
	addError: function (error, field = 'errors') {
		var aNr = -1
		var root = this
		if (this.uId || this.uId === 0) {		// Handelt es sich um ein "ParserObject"?
			aNr = this.uId
			if (Array.isArray(this[field])) {
				this[field].push({'err': error})
			}
			root = this.root
		}
		if (!Array.isArray(root[field][aNr])) {
			Vue.set(root[field], aNr, [])
		}
		root[field][aNr].push({'obj': this, 'err': error})
	},
	deleteErrors: function (field = 'errors') {
		var aNr = -1
		var root = this
		if (this.uId || this.uId === 0) {		// Handelt es sich um ein "ParserObject"?
			aNr = this.uId
			if (Array.isArray(this[field])) {
				this[field] = []
			}
			root = this.root
		}
		Vue.delete(root[field], aNr)
	},
	addWarning: function (warning) {
		localFunctions.addError.call(this, warning, 'warnings')
	},
	deleteWarnings: function () {
		localFunctions.deleteErrors.call(this, 'warnings')
	},
	getCompressedBaseError: function () {
		let cErrors = {}
		if (Object.keys(this.errors).length > 0) {
			let lErr = undefined
			let cErrKey = []
			Object.keys(this.errors).forEach(function (aErrKey) {
				if (lErr) {
					if (this.errors[aErrKey].length !== 1
						|| lErr[0].err !== this.errors[aErrKey][0].err) {
						cErrors[cErrKey[0] + '-' + cErrKey[cErrKey.length - 1]] = lErr
						cErrKey = []
					}
				}
				lErr = this.errors[aErrKey]
				cErrKey.push(aErrKey)
			}, this)
			if (lErr) {
				cErrors[cErrKey[0] + '-' + cErrKey[cErrKey.length - 1]] = lErr
				cErrKey = []
			}
		}
		// console.log(cErrors)
		return cErrors
	},
	updateFamilyErrors: function () {
		if (this.family.length > 0) {
			this.family.forEach(function (aObj) {
				if (aObj.errors.length > 0 && aObj.parents.length > 0) {
					aObj.parents[0].childsWithErrors = true
					aObj.parents.forEach(function (aPar) {
						aPar.descendantsWithErrors = true
					})
				}
			}, this)
		}
	},
}

export default localFunctions