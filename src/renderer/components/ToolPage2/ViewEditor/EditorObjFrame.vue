<template>
	<div class="obj just-childs" v-if="layoutBase === 'justChilds'">
		<slot name="childs"/>
	</div>

	<div class="inline" v-else>
		<b-card class="obj paneldecent mib10" v-if="layoutBase === 'panel'"
						:header="title" no-body>
			<div @contextmenu.prevent="contextMenue" slot="header">
				<button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle">
					<span><b>{{ title }}</b></span>
					<font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
				</button>
			</div>
			<b-collapse v-model="isOpen" :id="'collapse-' + _uid">
				<b-card-body>
					<div @contextmenu.prevent="contextMenue" class="context">
						<slot/>
					</div>
					<slot name="childs"/>
				</b-card-body>
			</b-collapse>
		</b-card>

		<div :class="'obj lb-' + layoutBase" v-else>
			<div @contextmenu.prevent="contextMenue" class="context">
				<b v-if="title">{{ title }}:</b><br v-if="layoutBase === 'box'"/>
				<slot/>
			</div>
			<slot name="childs"/>
		</div>

		<vue-context ref="contextMenuEditor" v-if="contextMenuCached">
			<div class="context-menu-editor-title"><b>Tag:</b> {{ this.content.orgXmlObj.name }}</div>
			<ul>
				<li>test ...</li>
			</ul>
		</vue-context>
	</div>
</template>

<script>
	import { VueContext } from 'vue-context'

	export default {
		name: 'EditorObjFrame',
		props: {
			content: Object,
		},
		data () {
			return {
				'isOpen': true,
				contextMenuCached: false,
			}
		},
		computed: {
			layoutBase () {		// Mögliche Rückgabewerte: 'panel'/'panelClosed', 'justChilds', 'box', 'line' und 'inline'
				if (this.content.isRoot) { return 'justChilds' }
				if (this.content.parserObj.options && this.content.parserObj.options.get('layout.frame')) {
					if (this.content.parserObj.options.get('layout.frame') === 'panelClosed') {
						this.isOpen = false
						return 'panel'
					}
					return this.content.parserObj.options.get('layout.frame')
				}
				return 'panel'
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
			contextMenue: function (e) {
				this.contextMenuCached = true
				this.$nextTick(() => { this.$refs.contextMenuEditor.open(e) })
			}
		},
		components: {
			VueContext
		}
	}
</script>

<style scoped>
	.inline, .context {
		display: inline;
		cursor: default;
	}

	.obj.lb-inline {
		display: inline-block;
		padding: 0px 3px;
	}
	.obj.lb-inline:hover {
		background: #eee;
	}

	.context-menu-editor-title {
		padding: 2px 10px;
		background: #eee;
	}
	.v-context ul {
		padding: 0 !important;
	}
</style>
