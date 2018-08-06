<template>
	<b-card class="obj paneldecent mib10" v-if="layoutBase === 'panel'"
					:header="title" no-body>
		<div slot="header">
			<button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle">
				<span><b>{{ title }}</b></span>
				<font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
			</button>
		</div>
		<b-collapse v-model="isOpen" :id="'collapse-' + _uid">
			<b-card-body>
				<slot/>
			</b-card-body>
		</b-collapse>
	</b-card>

	<div class="obj just-content" v-else-if="layoutBase === 'justContent'">
		<slot/>
	</div>

	<div class="obj" v-else>
		<slot/>
	</div>
</template>

<script>
	export default {
		name: 'EditorObjFrame',
		props: {
			content: Object,
		},
		data () {
			return {
				'isOpen': true,
			}
		},
		computed: {
			layoutBase () {		// Mögliche Rückgabewerte: 'panel', 'justContent', 'box', 'line' und 'inline'
				if (this.content.isRoot) { return 'justContent' }
				return 'panel'
			},
			title () {
				if (this.content.parserObj.options) {
					if (this.content.parserObj.options.getResult('title')) {
						return this.content.parserObj.options.getResult('title')
					} else if (this.content.parserObj.options.get('tagAsTitle') || this.layoutBase === 'panel') {
						return this.content.orgXmlObj.name
					}
					return undefined
				}
			}
		},
		methods: {
		},
	}
</script>

<style scoped>
</style>
