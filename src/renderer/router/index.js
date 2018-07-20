import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/',
			name: 'start-page',
			component: require('@/components/StartPage').default
		},
		{
			path: '/tool',
			name: 'tool-page',
			component: require('@/components/ToolPage').default
		},
		{
			path: '/tool2',
			name: 'tool-page-2',
			component: require('@/components/ToolPage2').default
		},
		{
			path: '*',
			redirect: '/'
		}
	]
})
