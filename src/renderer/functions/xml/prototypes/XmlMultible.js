// import xmlFunctions from '@/functions/XmlFunctions'

const localFunctions = {
	addError: function (error) {
		var aNr = -1
		var root = this
		if (this.uId || this.uId === 0) {		// Handelt es sich um ein "ParserObject"?
			aNr = this.uId
			if (Array.isArray(this.errors)) {
				this.errors.push({'err': error})
			}
			root = this.root
		}
		if (!Array.isArray(root.errors[aNr])) {
			root.errors[aNr] = []
		}
		root.errors[aNr].push({'obj': this, 'err': error})
	},
}

export default localFunctions
