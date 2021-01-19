import Vue from 'vue'

const inBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
const elIpa = '__rt_ipa__'

const ipaKeys = {
  'a': ['á', 'â', 'ã', 'å', 'æ', 'ā', 'ă', 'ą', 'ǎ', 'ǡ', 'ǻ', 'ȃ', 'ȧ', 'ɒ', 'ͣ', 'ᵃ', 'ᵄ', 'ḁ', 'ạ', 'ẫ', 'ặ', 'ₐ', '', '', '', '', '', '', '', ''],
  'ä': ['ǟ', ''],
  'b': ['ᵇ', 'ᷨ', 'ḇ', '', ''],
  'c': ['ć', 'ċ', 'č', 'ᶜ'],
  'd': ['ð', 'ď', 'ͩ', 'δ', 'ᵈ', 'ḋ', 'ḍ', 'ḏ', 'ḓ', '', '', ''],
  'e': ['è', 'é', 'ê', 'ë', 'ē', 'ĕ', 'ė', 'ę', 'ě', 'ȇ', 'ə', 'ɛ', 'ͤ', 'ᵉ', 'ᵊ', 'ᵋ', 'ᷪ', 'ḗ', 'ḙ', 'ḛ', 'ẹ', 'ẽ', 'ễ', 'ệ', 'ₑ', 'ₔ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  'f': ['ƒ', 'φ', 'ϝ', 'ᶠ', 'ᶲ', 'ḟ', 'ꬵ', '', ''],
  'g': ['ĝ', 'ğ', 'ġ', 'ǥ', 'ǧ', 'ǵ', 'γ', 'ᵍ', 'ḡ', ''],
  'h': ['ĥ', 'ȟ', 'ʰ', 'ͪ', 'ḣ', 'ḫ', 'ẖ', 'ₕ', ''],
  'i': ['ì', 'í', 'î', 'ï', 'ĩ', 'ī', 'ĭ', 'į', 'ǐ', 'ȋ', 'ɩ', 'ͥ', 'ί', 'ι', 'ϊ', 'ᵢ', 'ᶥ', 'ḭ', 'ị', 'ῑ', 'ῖ', 'ⁱ', '', '', '', '', '', '', '', '', '', '', ''],
  'j': ['ᶨ'],
  'k': ['ķ', 'κ', 'ᵏ', 'ᷜ', 'ḳ', 'ḵ'],
  'l': ['ľ', 'ɫ', 'ʟ', 'ˡ', 'λ', 'ᷝ', 'ḷ', 'ḻ', 'ḽ', 'ₗ', 'ꭞ', '', '', '', '', '', '', ''],
  'm': ['ᵐ', 'ḿ', 'ṁ', 'ṃ'],
  'n': ['ñ', 'ń', 'ň', 'ŋ', 'ᷠ', 'ṅ', 'ṇ', 'ṉ', 'ṋ', 'ⁿ', 'ₙ', '', '', '', '', '', '', '', '', '', ''],
  'o': ['ò', 'ó', 'ô', 'õ', 'ō', 'ŏ', 'ǒ', 'ǫ', 'ǭ', 'ȏ', 'ȭ', 'ȯ', 'ȱ', 'ɔ', 'ͦ', 'ᵒ', 'ṓ', 'ọ', 'ỗ', 'ộ', 'ₒ', '', '', '', '', ''],
  'ö': ['ø', 'œ', 'ᷳ', '', '', '', '', '', '', '', '', ''],
  'p': ['π', 'ᵖ'],
  'r': ['ŕ', 'ř', 'ȓ', 'ʀ', 'ʳ', 'ͬ', 'ᵣ', 'ṙ', 'ṛ', 'ṟ', '', '', '', ''],
  's': ['ś', 'ŝ', 'š', 'ʒ', 'ˢ', 'σ', 'ṡ', 'ṣ', 'ₛ'],
  'ß': [''],
  't': ['þ', 'ţ', 'ť', 'ͭ', 'τ', 'ᵗ', 'ṫ', 'ṭ', 'ṯ', 'ṱ', '', ''],
  'u': ['ú', 'û', 'ũ', 'ū', 'ŭ', 'ů', 'ų', 'ǔ', 'ȗ', 'ʊ', 'ͧ', 'ᵘ', 'ᵤ', 'ṷ', 'ụ', '', '', '', '', '', '', '', '', '', ''],
  'ü': ['ǖ', 'ǘ', '', '', '', ''],
  'w': ['ʷ', 'ᴡ', 'ᷱ', 'ẃ'],
  'x': ['ˣ', 'ͯ', 'χ', 'ẋ', 'ₓ', '', ''],
  'y': ['ÿ', 'ȳ'],
  'z': ['ź', 'ż', 'ž', 'ᶻ', ''],
  '+': ['̀', '́', '̂', '̃', '̄', '̆', '̇', '̈', '̊', '̌', '̐', '̑', '̓', '̔', '͡', '᪱'],
  '-': ['̣', '̤', '̥', '̧', '̨', '̩', '̬', '̭', '̮', '̯', '̰', '̱', 'ͅ', '͓', '͜', '᪸', '', ''],
  '#': ['~', '·', '×', 'ʾ', 'ʿ', '˙', '˜', 'ᶺ', 'ⸯ'],
  '"': ['“', '„'],
  '(': ['⁽'],
  ')': ['⁾'],
  '0': ['⁰'],
  '1': ['¹'],
  '2': ['²'],
  '3': ['³'],
  '4': ['⁴'],
  '5': ['⁵'],
  '6': ['⁶'],
  '7': ['⁷'],
  '8': ['⁸'],
  '9': ['⁹']
}

function insertAfter (parentNode, newNode, referenceNode) {
  if (parentNode) {
    parentNode.insertBefore(newNode, referenceNode ? referenceNode.nextSibling : parentNode.firstChild)
  }
}

function applyElIpa (el, bindings, vNode) {
  if (!inBrowser) {
    return
  }
  // console.log(bindings.value, el, el.parentNode, bindings, vNode)
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
    if (el[elIpa].$destroy) {
      el[elIpa].$destroy()
    }
    el[elIpa] = null
    delete el[elIpa]
  }
}

var ExtIpa = Vue.extend({
  template: '<div ref="ipa" :style="\'position: absolute; bottom: 100%; left: \' + left + \'px; max-width: \' + maxWidth + \'px; max-height: 150px; overflow-y: auto; background: #fff; padding: 10px; padding-bottom: 0; border: 1px solid #eee; border-radius: 5px; min-width: 250px;\'" v-if="ready && aKeys.length > 0">'
          + '	<div style="margin-bottom: 5px; white-space: nowrap;" v-for="aKey in aKeys">'
          + '		<span style="display: inline-block; width: 31px; text-align: center; margin-right: 5px; padding: 4px 8px;">{{ aKey.k }}</span>'
          + '		<button @click="setKey(aKey.k, pKey)" @keyup.esc="unsetKeys()" @blur="blur" ref="aBtns" class="btn btn-grey btn-sm" style="display: inline-block; margin-right: 5px; margin-bottom: 5px; min-width: 35px;" v-for="pKey in aKey.a">{{ pKey }}</button>'
          + '	</div>'
          + '</div>',
  data () {
    return {
      'aKeys': [],
      'aElement': null,
      'ready': false,
      'lastPosition': null,
      'left': 0,
      'maxWidth': 1500
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
    'aKeys' (nVal) {
      this.left = 0
      this.maxWidth = 1500
      this.$nextTick(() => {
        if (nVal && nVal.length > 0 && this.ready && this.$refs.ipa) {
          let aClientWidth = this.$el.getRootNode().documentElement.clientWidth
          let aIpaRect = this.$refs.ipa.getBoundingClientRect()
          if (aIpaRect.left + aIpaRect.width > aClientWidth) {
            if (aIpaRect.width > aClientWidth - 75) {
              this.maxWidth = aClientWidth - 75
              this.left = -aIpaRect.left + 25
            } else {
              this.left = -aIpaRect.left + aClientWidth - aIpaRect.width - 50
            }
          }
        }
      })
    }
  },
  methods: {
    blur (e) {
      this.$nextTick(() => {
        if (this.aKeys.length > 0) {
          let aEl = e.relatedTarget || document.activeElement
          if (aEl !== this.aElement && this.$refs.aBtns.indexOf(aEl) === -1) {
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
            let alKey = ''
            if (aSel.focusOffset > 2) {
              alKey = this.aElement.innerText.substring(aSel.focusOffset - 3, aSel.focusOffset)
              if (ipaKeys[alKey]) {
                this.aKeys.push({'k': alKey, 'a': ipaKeys[alKey]})
              }
            }
            if (aSel.focusOffset > 1) {
              alKey = this.aElement.innerText.substring(aSel.focusOffset - 2, aSel.focusOffset)
              if (ipaKeys[alKey]) {
                this.aKeys.push({'k': alKey, 'a': ipaKeys[alKey]})
              }
            }
            let aKey = this.aElement.innerText.substring(aSel.focusOffset - 1, aSel.focusOffset)
            if (aKey && ipaKeys[aKey]) {
              this.aKeys.push({'k': aKey, 'a': ipaKeys[aKey]})
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
    this.$el.parentNode.removeChild(this.$el)
  },
})

export default {
  bind (el, bindings, vNode) {
    if (bindings.value) {
      applyElIpa(el, bindings, vNode)
    } else {
      removeElIpa(el)
    }
  },
  inserted (el, bindings, vNode) {
    if (bindings.value) {
      applyElIpa(el, bindings, vNode)
    } else {
      removeElIpa(el)
    }
  },
  update (el, bindings, vNode) {
    if (bindings.value !== bindings.oldValue) {
      if (bindings.value) {
        applyElIpa(el, bindings, vNode)
      } else {
        removeElIpa(el)
      }
    }
  },
  componentUpdated (el, bindings, vNode) {
    if (bindings.value !== bindings.oldValue) {
      if (bindings.value) {
        applyElIpa(el, bindings, vNode)
      } else {
        removeElIpa(el)
      }
    }
  },
  unbind (el) {
    removeElIpa(el)
  }
}
