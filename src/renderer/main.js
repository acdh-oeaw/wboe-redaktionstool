import Vue from 'vue'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'
import VueCodemirror from 'vue-codemirror'

import 'codemirror/lib/codemirror.css'

import App from './App'
import router from './router'
import store from './store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus, faAngleDown, faAngleUp, faAngleLeft, faAngleRight, faCaretDown, faCaretUp, faCaretLeft, faCaretRight, faLock, faLockOpen, faFont, faEdit, faExclamationTriangle, faFolder, faFolderOpen, faFile, faProjectDiagram, faComment, faEye, faEyeSlash, faCheck, faTimes, faClipboardCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'

library.add(faPlus, faMinus, faAngleDown, faAngleUp, faAngleLeft, faAngleRight, faCaretDown, faCaretUp, faCaretLeft, faCaretRight, faLock, faLockOpen, faFont, faEdit, faExclamationTriangle, faFile, faFolder, faFolderOpen, faProjectDiagram, faComment, faEye, faEyeSlash, faCheck, faTimes, faClipboardCheck)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('font-awesome-layers', FontAwesomeLayers)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueCodemirror)

Vue.mixin({		// Global verfügbare Funktionen
	methods: {
		htmlEncode: function (html) {		// HTML-Sonderzeichen schützen
			return document.createElement('a').appendChild(document.createTextNode(html)).parentNode.innerHTML
		},
		hasSubProp: function (obj, propertys) {		// Ermitten ob Property in einem verschachtelten Objekt existiert
			var out = false
			if ((typeof propertys === 'string') && (propertys !== null) && propertys.length > 0) {
				var aObj = obj
				propertys.split('.').some(function (property) {
					if ((typeof aObj === 'object') && (aObj !== null)) {
						if (aObj.hasOwnProperty(property)) {
							out = true
							aObj = aObj[property]
						} else {
							out = false
							return true
						}
					} else {
						out = false
						return true
					}
				})
			}
			return out
		},
		getValOfSubProp: function (obj, propertys) {		// Gibt Wert eines Property eines verschachtelten Objekts zurück
			if (this.hasSubProp(obj, propertys)) {
				var aObj = obj
				propertys.split('.').some(function (property) {
					aObj = aObj[property]
				})
				return aObj
			} else {
				return undefined
			}
		},
		isValInArrOfSubProp: function (obj, propertys, value) {		// Ist Wert in Array eines verschachtelten Objekts vorhanden
			var aObj = this.getValOfSubProp(obj, propertys)
			if (Array.isArray(aObj)) {
				return (aObj.indexOf(value) > -1)
			} else {
				return undefined
			}
		}
	}
})

Vue.filter('prettyBytes', function (num) {		// Byte-Angaben formatieren
	if (typeof num !== 'number' || isNaN(num)) {
		throw new TypeError('Expected a number')
	}
	var exponent
	var unit
	var neg = num < 0
	var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	if (neg) {
		num = -num
	}
	if (num < 1) {
		return (neg ? '-' : '') + num + ' B'
	}
	exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
	num = (num / Math.pow(1000, exponent)).toFixed(2) * 1
	unit = units[exponent]
	return (neg ? '-' : '') + num.toLocaleString() + ' ' + unit
})

/* eslint-disable no-new */
new Vue({
	components: { App },
	router,
	store,
	template: '<App/>'
}).$mount('#app')
