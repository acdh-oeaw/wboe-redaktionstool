<template>
	<div>
		<div class="context-menu-title"><b>Tag:</b> {{ this.content.orgXmlObj.name }}</div>
		<template v-if="attributes">
			<div class="context-menu-subtitle"><b>Attribute:</b></div>
			<ul>
				<li v-for="(aVal, aKey) in attributes" @mouseover="subShow = aKey" @mouseleave="subShow = null">
					<font-awesome-icon :icon="aVal.icon" class="fa-icon" v-if="aVal.icon"/>
					<font-awesome-icon :icon="((aVal.editable) ? 'edit' : 'lock')" class="fa-icon right"/>
					<span>{{ aKey + ((aVal.value) ? ' = ' + aVal.value : '') }}</span>
					<div class="subContext" :ref="'subContext'" :style="'top:' + subContextMenuTopPx + 'px;'" v-if="aVal.editable && subShow === aKey">
						<div class="sel-attribut" v-if="aVal.editType === 'select'">
							<button @click="selectAttr(aKey, -1)" class="sel-obj">
								<font-awesome-icon icon="check" class="fa-icon" v-if="!aVal.value"/>
								Kein Wert!
							</button>
							<button @click="selectAttr(aKey, attrKey)" class="sel-obj" v-for="(attrVal, attrKey) in aVal.options.possibleValues">
								<font-awesome-icon icon="check" class="fa-icon" v-if="attrVal === aVal.value"/>
								{{ attrVal }}
							</button>
						</div>
						<div class="txt-attribut" v-else>
							<font-awesome-icon @click="$refs.attrEdit[0].focus()" icon="edit" class="fa-icon right" :title="aVal.editType"/>
							<span class="attr-edit" ref="attrEdit" @input="valAttrUpdate" @focus="valAttrUpdate" @blur="valAttrUpdateValue(aKey, $event)" @keyup.enter="valAttrUpdateValue(aKey, $event)" @keydown.enter.prevent contenteditable>{{ aVal.value }}</span>
						</div>
					</div>
				</li>
			</ul>
		</template>
		<template v-if="this.content.addableAfter.length > 0">
			<div class="context-menu-subtitle"><b>Hinzufügen:</b></div>
			<ul>
				<li v-for="(aVal, aKey) in this.content.addableAfter">
					<font-awesome-icon icon="plus" class="fa-icon"/>
					{{ aVal.title }}
				</li>
			</ul>
		</template>
		<EditorContextMenuContent :content="content.parents[0]" :subContextMenuLeft="subContextMenuLeft" v-if="content.parents.length > 0 && content.parserObj.options && content.parents.length > 0 && content.parserObj.options.get('editor.parentInContext')"/>
	</div>
</template>

<script>
	import _ from 'lodash'
	import SelectPossibleValues from './SelectPossibleValues'
	import veFunctions from './functions'

	export default {
		name: 'EditorContextMenuContent',
		props: {
			content: Object,
			subContextMenuLeft: Boolean,
		},
		data () {
			return {
				'subShow': null
			}
		},
		computed: {
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
						oAttr[aAttr] = {'value': aVal, 'options': aAttributes[aAttr], 'icon': aIcon, 'editable': (aAttributes[aAttr].type === 'edit'), 'editType': ((aAttributes[aAttr].possibleValues) ? 'select' : 'text')}
					}, this)
					// console.log(oAttr)
					return oAttr
				}
				return null
			},
		},
		watch: {
			subShow: function (nVal, oVal) {
				if (nVal) {
					this.subContextMenuTopPx = 0
					this.$nextTick(() => {
						if (this.$refs.subContext && this.$refs.subContext.length > 0) {
							let aOverBottom = this.$refs.subContext[0].getBoundingClientRect().bottom - window.innerHeight + 25
							if (aOverBottom > 0) {
								this.subContextMenuTopPx = -aOverBottom
							}
						}
					})
				}
			}
		},
		methods: {
			selectAttr: function (aAttr, key) {
				this.content.orgXmlObj.setAttribute(aAttr, this.content.parserObj.options.get('attributes.' + aAttr + '.possibleValues')[key])
				this.content.checkParser()
			},
			valAttrUpdateValue: function (aAttr, e) {
				this.content.orgXmlObj.setAttribute(aAttr, e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, ''))
				this.content.checkParser()
			},
			valAttrUpdate: _.debounce(function (e) {
				var restoreCaretPosition = veFunctions.saveCaretPosition(e.target)
				e.target.innerText = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
				restoreCaretPosition()
			}, 20),
		},
		components: {
			SelectPossibleValues,
		},
	}
</script>

<style scoped>
	.editorcontextmenu {
		width: 250px;
		background: #eee;
		border: 1px solid #6ba1dc;
		box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
		display: block;
		margin: 0;
		padding: 0;
		position: fixed;
		z-index: 99999;
	}
	.editorcontextmenu ul {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 12px;
		font-weight: 600;
	}
	.editorcontextmenu ul li {
		position: relative;
		margin: 0;
		padding: 2px 25px;
		font-size: 14px;
		line-height: 1.4;
		cursor: pointer;
	}
	.editorcontextmenu ul li:hover {
		background: #18e;
		color: #eee;
	}
	.context-menu-title {
		padding: 2px 10px;
		background: #307ed2;
		color: #fff;
	}
	.context-menu-subtitle {
		background: #fff;
		padding: 1px 10px;
		font-size: 14px;
	}
	.editorcontextmenu ul li > span {
		display: block;
		max-width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.editorcontextmenu ul li > .fa-icon {
		position: absolute;
		margin-top: 4px;
		left: 7px;
	}
	.editorcontextmenu ul li > .fa-icon.right {
		left: auto;
		right: 7px;
	}
	.editorcontextmenu ul li > .subContext {
		display: block;
		position: absolute;
		max-height: 60vh;
		overflow-y: auto;
		left: 100%;
		top: 0;
		color: #333;
		background: #eee;
		border: 1px solid #6ba1dc;
		min-width: 250px;
		min-height: 100%;
		box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
	}
	.editorcontextmenu.left ul li > .subContext {
		left: auto;
		right: 100%;
	}

	button.sel-obj {
		position: relative;
		margin: 0;
		padding: 2px 25px;
		background: #eee;
		border: none;
		display: block;
		width: 100%;
		text-align: left;
	}
	button.sel-obj:hover {
		background: #18e;
		color: #eee;
	}
	button.sel-obj > .fa-icon {
		position: absolute;
		margin-top: 4px;
		left: 7px;
	}
	.txt-attribut {
		position: relative;
	}
	.txt-attribut .attr-edit {
		display: block;
		width: 100%;
		padding: 2px 25px
	}
	.txt-attribut .attr-edit:focus {
		background: #fff;
	}
	.txt-attribut > .fa-icon {
		position: absolute;
		margin-top: 4px;
		left: 7px;
	}
	.txt-attribut > .fa-icon.right {
		left: auto;
		right: 7px;
	}
</style>
