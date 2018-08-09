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
			<b-list-group flush v-if="content.addableInner.length > 0">
				<b-list-group-item style="background: #eee;">
					<div style="margin: -8px -9px;">
						<b-button size="sm" :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableInner" v-if="aVal.bShow">
							<font-awesome-icon icon="plus" class="fa-icon"/>
							{{ aVal.title }}
						</b-button>
					</div>
				</b-list-group-item>
			</b-list-group>
			<b-card-body>
				<div @contextmenu.prevent="contextMenue" class="context">
					<slot/>
				</div>
				<slot name="childs"/>
			</b-card-body>
		</b-collapse>
		<div slot="footer" style="margin: -8px -9px;" v-if="content.addableAfter.length > 0">
			<b-button size="sm" :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableAfter" v-if="aVal.bShow">
				<font-awesome-icon icon="plus" class="fa-icon"/>
				{{ aVal.title }}
			</b-button>
		</div>
		<EditorContextMenu :content="content" ref="contextMenuEditor" v-if="contextMenuCached"/>
	</b-card>

	<div :class="'obj lb-' + layoutBase + ((content.warnings.length > 0) ? ' warnings' : '')" v-else>
		<div :class="{'inline': layoutBase !== 'box'}" v-if="content.addableInner.length > 0">
			<b-button size="xs" variant="success" class="mir5" :title="content.addableInner[0].title" v-if="content.addableInner[0].bShow"><font-awesome-icon icon="plus" class="fa-icon"/><span class="focusVisInline"> {{ content.addableInner[0].title }}</span></b-button>
			<b-button @click="isOpenAdditionalAddInBtn = !isOpenAdditionalAddInBtn" size="xs" variant="secondary" class="mir5" title="Weitere mögliche Tags anzeigen." v-if="content.addableInner.length > 1"><font-awesome-icon :icon="((!isOpenAdditionalAddInBtn) ? 'eye' : 'eye-slash')" class="fa-icon"/></b-button>
			<b-button size="xs" :variant="((aVal.type === 'anywhere') ? 'secondary' : 'primary')" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableInner" v-if="aKey !== 0 && isOpenAdditionalAddInBtn">
				<font-awesome-icon icon="plus" class="fa-icon"/>
				{{ aVal.title }}
			</b-button>
		</div>
		<div @contextmenu.prevent="contextMenue" class="context">
			<b v-if="title">{{ title }}:</b><br v-if="title && layoutBase === 'box'"/>
			<slot/>
		</div>
		<slot name="childs"/>
		<div :class="{'inline': layoutBase !== 'box'}" v-if="content.addableAfter.length > 0">
			<b-button size="xs" variant="success" class="mir5" :title="content.addableAfter[0].title" v-if="content.addableAfter[0].type === 'self' && content.addableAfter[0].bShow"><font-awesome-icon icon="plus" class="fa-icon"/><span class="focusVisInline"> {{ content.addableAfter[0].title }}</span></b-button>
			<b-button @click="isOpenAdditionalAddBtn = !isOpenAdditionalAddBtn" size="xs" variant="secondary" class="mir5" title="Weitere mögliche Tags anzeigen." v-if="(content.addableAfter[0].type === 'self' && content.addableAfter.length > 1) || (content.addableAfter[0].type !== 'self' && content.addableAfter.length > 0)"><font-awesome-icon :icon="((!isOpenAdditionalAddBtn) ? 'eye' : 'eye-slash')" class="fa-icon"/></b-button>
			<b-button size="xs" :variant="((aVal.type === 'anywhere') ? 'secondary' : 'primary')" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableAfter" v-if="aVal.type !== 'self' && isOpenAdditionalAddBtn">
				<font-awesome-icon icon="plus" class="fa-icon"/>
				{{ aVal.title }}
			</b-button>
		</div>
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
				'isOpenAdditionalAddBtn': false,
				'isOpenAdditionalAddInBtn': false,
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
	.focusVisInline {
		display: none;
	}
	*:focus > .focusVisInline {
		display: inline;
	}
</style>
