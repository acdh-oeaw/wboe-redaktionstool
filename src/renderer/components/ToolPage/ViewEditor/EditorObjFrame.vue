<template>
	<div :class="{'obj': true, 'just-childs': true, 'warnings': content.warnings.length > 0}" v-if="layoutBase === 'justChilds'">
		<slot name="childs"/>
	</div>

	<b-card :class="{'obj': true, 'paneldecent': true, 'mitb5': true, 'warnings': content.warnings.length > 0}" v-else-if="layoutBase === 'panel'" :header="title" no-body>
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
		<div slot="footer" style="margin: -8px -9px;" v-if="this.content.addableAfter.length > 0">
			<b-button size="sm" :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" class="mir5" :key="aKey" v-for="(aVal, aKey) in this.content.addableAfter">
				<font-awesome-icon icon="plus" class="fa-icon"/>
				{{ aVal.title }}
			</b-button>
		</div>
		<EditorContextMenu :content="content" ref="contextMenuEditor" v-if="contextMenuCached"/>
	</b-card>

	<div :class="'obj lb-' + layoutBase + ((content.warnings.length > 0) ? ' warnings' : '')" v-else>
		<div @contextmenu.prevent="contextMenue" class="context">
			<b v-if="title">{{ title }}:</b><br v-if="title && layoutBase === 'box'"/>
			<slot/>
		</div>
		<slot name="childs"/>
		<EditorContextMenu :content="content" ref="contextMenuEditor" v-if="contextMenuCached"/>
	</div>
</template>

<script>
	import EditorContextMenu from './EditorContextMenu'

	export default {
		name: 'EditorObjFrame',
		props: {
			content: Object,
		},
		data () {
			return {
				'isOpen': true,
				'contextMenuCached': false,
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
				}
				return null
			},
		},
		methods: {
			contextMenue: function (e) {
				this.contextMenuCached = true
				this.$nextTick(() => {
					this.$refs.contextMenuEditor.open(e)
				})
			},
		},
		components: {
			EditorContextMenu,
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
	.obj.warnings {
		background: #fff4b9;
	}
</style>
