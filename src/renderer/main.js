import Vue from 'vue'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'

import App from './App'
import router from './router'
import store from './store'

import stdFunctions from './functions/stdFunctions'
import ipaDirectives from './directives/Ipa'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus, faAngleDown, faAngleUp, faAngleLeft, faAngleRight, faCaretDown, faCaretUp, faCaretLeft, faCaretRight, faSyncAlt, faLock, faLockOpen, faFont, faEdit, faExclamationTriangle, faFolder, faFolderOpen, faFile, faFileDownload, faProjectDiagram, faComment, faEye, faEyeSlash, faCheck, faTimes, faClipboardCheck, faExternalLinkAlt, faQuestionCircle, faBars, faSitemap, faClone, faIdBadge, faArrowsAltV, faTrashAlt, faCircleNotch, faSave, faMinusCircle, faBookOpen, faAsterisk, faAddressCard, faSearch, faInfo, faMapMarked, faSquare, faCheckSquare, faColumns, faExternalLinkSquareAlt, faGripLines, faFilePdf, faHourglass, faMousePointer } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'

library.add(faPlus, faMinus, faAngleDown, faAngleUp, faAngleLeft, faAngleRight, faCaretDown, faCaretUp, faCaretLeft, faCaretRight, faSyncAlt, faLock, faLockOpen, faFont, faEdit, faExclamationTriangle, faFolder, faFolderOpen, faFile, faFileDownload, faProjectDiagram, faComment, faEye, faEyeSlash, faCheck, faTimes, faClipboardCheck, faExternalLinkAlt, faQuestionCircle, faBars, faSitemap, faClone, faIdBadge, faArrowsAltV, faTrashAlt, faCircleNotch, faSave, faMinusCircle, faBookOpen, faAsterisk, faAddressCard, faSearch, faInfo, faMapMarked, faSquare, faCheckSquare, faColumns, faExternalLinkSquareAlt, faGripLines, faFilePdf, faHourglass, faMousePointer)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('font-awesome-layers', FontAwesomeLayers)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(BootstrapVue)

const isDev = process.env.NODE_ENV !== 'production'
Vue.config.performance = isDev

Vue.mixin({		// Global verfügbare Funktionen
	methods: {
		htmlEncode: stdFunctions.htmlEncode,
		hasSubProp: stdFunctions.hasSubProp,
		getValOfSubProp: stdFunctions.getValOfSubProp,
		isValInArrOfSubProp: stdFunctions.isValInArrOfSubProp,
	}
})

Vue.directive('rt-ipa', ipaDirectives)

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
