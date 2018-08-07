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
			<div class="context-menu-title"><b>Tag:</b> {{ this.content.orgXmlObj.name }}</div>
			<template v-if="attributes">
				<div class="context-menu-subtitle"><b>Attribute:</b></div>
				<ul>
					<li v-for="(aVal, aKey) in attributes" @mouseover="subShow = aKey" @mouseleave="subShow = null">
						<font-awesome-icon :icon="aVal.icon" class="fa-icon" v-if="aVal.icon"/>
						<font-awesome-icon :icon="((aVal.editable) ? 'edit' : 'lock')" class="fa-icon right"/>
						<span>{{ aKey + ((aVal.value) ? ' = ' + aVal.value : '') }}</span>
						<div :class="{'subContext': true, 'left': subContextMenuLeft}" :ref="'subContext'" :style="'top:' + subContextMenuTopPx + 'px;'" v-if="aVal.editable && subShow === aKey">
							xxx
						</div>
					</li>
				</ul>
		</template>
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
				'contextMenuCached': false,
				'subContextMenuLeft': false,
				'subContextMenuTopPx': false,
				'subShow': null,
			}
		},
		watch: {
			subShow: function (nVal, oVal) {
				if (nVal) {
					this.subContextMenuTopPx = 0
					this.$nextTick(() => {
						if (this.$refs.subContext && this.$refs.subContext.length > 0) {
							let aOverBottom = this.$refs.subContext[0].getBoundingClientRect().bottom - window.innerHeight + 30
							if (aOverBottom > 0) {
								this.subContextMenuTopPx = -aOverBottom
							}
						}
					})
				}
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
			},
			attributes () {
				if (this.content.parserObj.options && this.content.parserObj.options.get('attributes')) {
					let oAttr = {}
					let aAttributes = this.content.parserObj.options.get('attributes')
					Object.keys(aAttributes).forEach(function (aAttr) {
						let aIcon
						let aVal = this.content.orgXmlObj.attributes[aAttr]
						if (aVal) {
							// ToDo: weitere Prüfung?!
							aIcon = 'check'
						} else if (!aAttributes[aAttr].canBeEmpty || !aAttributes[aAttr].canBeEmpty.use) {
							aIcon = 'exclamation-triangle'
						}
						oAttr[aAttr] = {'value': aVal, 'options': aAttributes[aAttr], 'icon': aIcon, 'editable': (aAttributes[aAttr].type === 'edit')}
					}, this)
					console.log(oAttr)
					return oAttr
				}
				return null
			}
		},
		methods: {
			contextMenue: function (e) {
				this.contextMenuCached = true
				this.$nextTick(() => {
					this.subContextMenuLeft = (window.innerWidth / 2) < e.clientX
					this.$refs.contextMenuEditor.open(e)
				})
			},
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

	.context-menu-title {
		padding: 2px 10px;
		background: #eee;
	}
	.context-menu-subtitle {
		background: #fff;
		padding: 1px 10px;
		font-size: 14px;
	}
	.v-context ul li {
		position: relative;
		padding: 2px 20px;
		font-size: 14px;
		line-height: 1.4;
	}
	.v-context ul li > span {
		display: block;
		max-width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.v-context ul li > .fa-icon {
		position: absolute;
    margin-top: 4px;
    left: 12px;
	}
	.v-context ul li > .fa-icon.right {
		left: auto;
		right: 12px;
	}
	.v-context ul li > .subContext {
		display: block;
		position: absolute;
		max-height: 60vh;
		overflow-y: auto;
		left: 100%;
		top: 0;
		color: #333;
		background: #fff;
		border: 1px solid #ddd;
		min-width: 250px;
		min-height: 100%;
		box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
	}
	.v-context ul li > .subContext.left {
		left: auto;
		right: 100%;
	}
	.v-context ul {
		padding: 0 !important;
	}
</style>
