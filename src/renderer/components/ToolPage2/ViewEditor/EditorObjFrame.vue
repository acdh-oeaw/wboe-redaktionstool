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
				<slot name="childs"/>
			</b-card-body>
		</b-collapse>
	</b-card>

	<div class="obj just-childs" v-else-if="layoutBase === 'justChilds'">
		<slot name="childs"/>
	</div>

	<div :class="'obj lb-' + layoutBase" v-else>
		<b v-if="title">{{ title }}:</b><br v-if="layoutBase === 'box'"/>
		<slot/>
		<slot name="childs"/>
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
			layoutBase () {		// Mögliche Rückgabewerte: 'panel', 'justChilds', 'box', 'line' und 'inline'
				if (this.content.isRoot) { return 'justChilds' }
				if (this.content.parserObj.options && this.content.parserObj.options.get('layout.frame')) {
					return this.content.parserObj.options.get('layout.frame')
				}
				return 'panel'
				// return 'unknown'
			},
			title () {
				if (this.content.parserObj.options) {
					if (this.content.parserObj.options.getResult('title')) {
						return this.content.parserObj.options.getResult('title')
					} else if (this.content.parserObj.options.get('tagAsTitle') || this.layoutBase === 'panel') {
						return this.content.orgXmlObj.name
					}
					return null
				}
			}
		},
		methods: {
		},
	}
</script>

<style scoped>
	.obj.lb-inline {
		display: inline-block;
		padding: 0px 3px;
	}
	.obj.lb-inline:hover {
		background: #eee;
	}
</style>
