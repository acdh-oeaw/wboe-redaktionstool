import Vue from 'vue'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'
import VueCodemirror from 'vue-codemirror'

import 'codemirror/lib/codemirror.css'

import App from './App'
import router from './router'
import store from './store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus, faAngleDown, faAngleUp, faAngleLeft, faAngleRight, faCaretDown, faCaretUp, faCaretLeft, faCaretRight, faLock, faLockOpen, faFont, faEdit, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
// import { faComment } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faPlus, faMinus, faAngleDown, faAngleUp, faAngleLeft, faAngleRight, faCaretDown, faCaretUp, faCaretLeft, faCaretRight, faLock, faLockOpen, faFont, faEdit, faExclamationTriangle)

Vue.component('font-awesome-icon', FontAwesomeIcon)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueCodemirror)

/* eslint-disable no-new */
new Vue({
	components: { App },
	router,
	store,
	template: '<App/>'
}).$mount('#app')
