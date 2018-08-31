import Vue from 'vue'

const inBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
const elIpa = '__rt_ipa__'

const ipaKeys = {
	'a':	['a', 'ɑ', 'ɐ'],
	'b':	['b', 'b̥', 'β', 'β̥'],
	'p':	['p', 'pʰ'],
	'd':	['d', 'd̥'],
	't':	['t', 'tʰ'],
	'e':	['e', 'ɛ', 'ə'],
	'ä':	['ɛː', 'æ'],
	'f':	['f', 'v̥'],
	'g':	['g', 'g̥'],
	'k':	['k', 'kʰ', 'k͡χ'],
	'h':	['ʰ'],
	'i':	['i', 'ɪ'],
	'l':	['l', 'ɭ', 'ɬ'],
	'm':	['m', 'ɱ'],
	'n':	['n', 'ŋ', 'ⁿ', 'n̩'],
	'o':	['o', 'ɔ'],
	'oa':	['ɔɐ̯', 'ɔo̯'],
	'ö':	['ø', 'œ'],
	'r':	['ʁ', 'ʀ', 'ɹ', 'ɾ'],
	'z':	['z', 'z̥'],
	'sch': ['ʃ', 'ʒ̥', 'ʒ'],
	'u':	['u', 'ʊ', 'ue̯'],
	'ü':	['y', 'ʏ', 'ʏɐ̯'],
	'w':	['v', 'β', 'β̥'],
	'ch':	['ç', 'x', 'χ', 'ɣ̥', 'ʝ̥'],
	'ei':	['aɛ̯', 'æe̯', 'æː'],
	'au':	['ɑɔ̯'],
	'eu':	['ɔe̯'],
	'ie':	['ɪɐ̯'],
	'ia':	['ɪɐ̯'],
	'pf':	['p͡f', 'b̥͡f'],
	'ts':	['t͡s', 'd̥͡s'],
	'1':	['̯', '̃', '͡'],
	'0':	['̯', 'ʰ', 'ⁿ', '̃', 'ː', '͡', '̝', '̞', 'ʔ'],
	':':	['ː'],
	'.':	['̩', '̥', '̝', '̞'],
	'?':	['?', 'ʔ']
}

function insertAfter (parentNode, newNode, referenceNode) {
	if (parentNode) {
		parentNode.insertBefore(newNode, referenceNode ? referenceNode.nextSibling : parentNode.firstChild)
	}
}

function applyElIpa (el, bindings, vnode) {
	if (!inBrowser) {
		return
	}
	// console.log(el, el.parentNode, bindings, vnode)
	if (!el[elIpa]) {
		el[elIpa] = new ExtIpa().$mount()
		el[elIpa].aElement = el
		// console.log(ipaKeys)
	} else {
		el.parentNode.style.position = 'relative'
		insertAfter(el.parentNode, el[elIpa].$el, el)
	}
}
function removeElIpa (el) {
	if (!inBrowser) {
		return
	}
	if (el[elIpa]) {
		if (el[elIpa].destroy) {
			el[elIpa].destroy()
		}
		el[elIpa] = null
		delete el[elIpa]
	}
}

var ExtIpa = Vue.extend({
	template: '<div style="position: absolute; bottom: 100%; left: 0; max-height: 150px; overflow-y: auto; background: #fff; padding: 10px; padding-bottom: 5px; border: 1px solid #eee; border-radius: 5px; min-width: 250px;" v-if="ready && aKeys.length > 0">'
					+ '	<div style="margin-bottom: 5px; white-space: nowrap;" v-for="aKey in aKeys">'
					+ '		<span style="display: inline-block; width: 31px; text-align: center;">{{ aKey.k }}</span>'
					+ '		<button @click="setKey(aKey.k, pKey)" @keyup.esc="unsetKeys()" @blur="blur" ref="aBtns" class="btn btn-sm" style="display: inline-block; margin-right: 5px; min-width: 35px;" v-for="pKey in aKey.a">{{ pKey }}</button>'
					+ '	</div>'
					+ '</div>',
	data () {
		return {
			'aKeys': [],
			'aElement': null,
			'ready': false,
			'lastPosition': null,
		}
	},
	watch: {
		'aElement' (nVal, oVal) {
			if (oVal) {
				oVal.removeEventListener('keyup', this.keyUp)
				oVal.removeEventListener('blur', this.blur)
			}
			if (nVal) {
				this.ready = true
				nVal.addEventListener('keyup', this.keyUp)
				nVal.addEventListener('blur', this.blur)
			}
		},
	},
	methods: {
		blur (e) {
			this.$nextTick(() => {
				if (this.aKeys.length > 0) {
					if (document.activeElement !== this.aElement && this.$refs.aBtns.indexOf(document.activeElement) === -1) {
						this.aKeys = []
					}
				}
			})
		},
		unsetKeys () {
			if (this.aKeys.length > 0) {
				this.aKeys = []
				if (this.lastPosition || this.lastPosition === 0) {
					let selection = document.getSelection()
					selection.removeAllRanges()
					var range = new Range()
					range.setStart(this.aElement.firstChild, this.lastPosition)
					selection.addRange(range)
				}
			}
		},
		setKey (aKey, nKey) {
			this.aElement.innerText = this.aElement.innerText.substring(0, this.lastPosition - aKey.length) + nKey + this.aElement.innerText.substring(this.lastPosition, this.aElement.innerText.length)
			this.lastPosition = this.lastPosition - aKey.length + nKey.length
			this.unsetKeys()
		},
		keyUp (e) {
			if (e.key !== 'Tab' && e.key !== 'Shift') {
				this.aKeys = []
				let aSel = document.getSelection()
				this.lastPosition = aSel.focusOffset
				if (e.key.length === 1 && aSel.focusOffset === aSel.baseOffset) {
					if (e.key === '!') {
						for (var key in ipaKeys) {
							if (!ipaKeys.hasOwnProperty(key)) continue
							this.aKeys.push({'k': key, 'a': ipaKeys[key]})
						}
					} else {
						let alkey = ''
						if (aSel.focusOffset > 2) {
							alkey = this.aElement.innerText.substring(aSel.focusOffset - 3, aSel.focusOffset)
							if (ipaKeys[alkey]) {
								this.aKeys.push({'k': alkey, 'a': ipaKeys[alkey]})
							}
						}
						if (aSel.focusOffset > 1) {
							alkey = this.aElement.innerText.substring(aSel.focusOffset - 2, aSel.focusOffset)
							if (ipaKeys[alkey]) {
								this.aKeys.push({'k': alkey, 'a': ipaKeys[alkey]})
							}
						}
						var akey = this.aElement.innerText.substring(aSel.focusOffset - 1, aSel.focusOffset)
						if (akey && ipaKeys[akey]) {
							this.aKeys.push({'k': akey, 'a': ipaKeys[akey]})
						}
					}
				}
			}
		},
	},
	beforeDestroy () {
		if (this.aElement) {
			this.aElement.removeEventListener('keyup', this.keyUp)
			this.aElement.removeEventListener('blur', this.blur)
		}
	},
})

export default {
	bind (el, bindings, vnode) {
		applyElIpa(el, bindings, vnode)
	},
	inserted (el, bindings, vnode) {
		applyElIpa(el, bindings, vnode)
	},
	update (el, bindings, vnode) {
		if (bindings.value !== bindings.oldValue) {
			applyElIpa(el, bindings, vnode)
		}
	},
	componentUpdated (el, bindings, vnode) {
		if (bindings.value !== bindings.oldValue) {
			applyElIpa(el, bindings, vnode)
		}
	},
	unbind (el) {
		removeElIpa(el)
	}
}
