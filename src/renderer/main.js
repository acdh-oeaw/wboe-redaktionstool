import Vue from 'vue'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'
import VueCodemirror from 'vue-codemirror'

import 'codemirror/lib/codemirror.css'

import App from './App'
import router from './router'
import store from './store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus, faAngleDown, faAngleUp, faAngleLeft, faAngleRight, faCaretDown, faCaretUp, faCaretLeft, faCaretRight, faLock, faLockOpen, faFont, faEdit, faExclamationTriangle, faFolder, faFolderOpen, faFile, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
// import { faComment } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faPlus, faMinus, faAngleDown, faAngleUp, faAngleLeft, faAngleRight, faCaretDown, faCaretUp, faCaretLeft, faCaretRight, faLock, faLockOpen, faFont, faEdit, faExclamationTriangle, faFolder, faFolderOpen, faFile, faProjectDiagram)

Vue.component('font-awesome-icon', FontAwesomeIcon)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueCodemirror)

Vue.filter('prettyBytes', function (num) {
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
