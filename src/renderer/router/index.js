import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/home',
			name: 'start-page',
			component: require('@/components/StartPage').default
		},
		{
			path: '/tool',
			name: 'tool-page',
			component: require('@/components/ToolPage').default
		},
		{
			path: '*',
			redirect: '/home'
		}
	]
})
