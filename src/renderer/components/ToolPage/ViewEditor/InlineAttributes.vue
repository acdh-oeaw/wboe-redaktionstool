<template>
	<span :class="'inline-attr layout-' + (attrOpt.class || 'attr')">
		<span class="before" v-if="attrOpt.before">{{ attrOpt.before }}</span>
		<span class="title" v-if="!attrOpt.hideTitle">{{ attrOpt.title || attrKey }}</span>
		<template v-if="parserOptions && parserOptions.type === 'edit'">
			<span class="value" v-if="parserOptions.possibleValues">
				<SelectPossibleValues @select="setSelected" :selected="getSelected()" :empty="this.parserOptions.canBeEmpty" :selectedText="attrValue" :values="this.parserOptions.possibleValues" v-if="!refreshSelect"/>
			</span>
			<span class="value" v-else>
				<span class="attr-edit" ref="attrEdit" @input="valAttrUpdate" @focus="valAttrUpdate" @blur="valAttrUpdateValue" @keyup.enter="valAttrUpdateValue" @keydown.enter.prevent contenteditable>{{ attrValue }}</span>
				<font-awesome-icon @click="$refs.attrEdit.focus()" icon="edit" class="fa-icon"/>
			</span>
		</template>
		<span class="value" v-else>{{ attrValue || '&nbsp;' }}</span>
		<span class="before" v-if="attrOpt.after">{{ attrOpt.after }}</span>
	</span>
</template>

<script>
	import _ from 'lodash'
	import SelectPossibleValues from './SelectPossibleValues'
	import veFunctions from './functions'
	import stdFunctions from '@/functions/stdFunctions'

	export default {
		name: 'InlineAttributes',
		props: {
			content: Object,
			attrOpt: Object,
			attrKey: String,
		},
		data () {
			return {
				'isOpen': true,
				'refreshSelect': false,
			}
		},
		computed: {
			attrValue () {
				if (this.parserOptions) {
					let pv = this.parserOptions.possibleValues
					let aVal = this.content.orgXmlObj.attributes[this.attrKey]
					if (pv && pv.length > 0 && pv[0].value) {
						let xVal = stdFunctions.getFirstKeyOfValueInPropertyOfArray(pv, 'value', aVal)
						if (xVal >= 0 && pv[xVal].title) {
							aVal = pv[xVal].title
						}
					}
					return aVal
				}
			},
			parserOptions () {
				return this.content.parserObj.options.get('attributes.' + this.attrKey)
			}
		},
		watch: {
			'refreshSelect': function (nVal) {
				if (nVal) {
					this.$nextTick(() => {
						this.refreshSelect = false
					})
				}
			},
		},
		methods: {
			getSelected: function () {		// Gibt die aktuell ausgewählte Option zurück
				let sVal = this.content.orgXmlObj.attributes[this.attrKey]
				let oKey = -1
				if (this.parserOptions) {
					this.parserOptions.possibleValues.some(function (aVal, aKey) {
						if ((aVal.value || aVal) === sVal) {
							oKey = aKey
							return true
						}
					}, this)
				}
				return oKey
			},
			setSelected: function (key) {
				if (this.parserOptions) {
					this.content.orgXmlObj.setAttribute(this.attrKey, this.parserOptions.possibleValues[key])
					this.content.checkParser()
					this.refreshSelect = true
				}
			},
			valAttrUpdateValue: function (e) {
				this.content.orgXmlObj.setAttribute(this.attrKey, e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, ''))
				this.content.checkParser()
			},
			valAttrUpdate: _.debounce(function (e) {
				var restoreCaretPosition = veFunctions.saveCaretPosition(e.target)
				e.target.innerText = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
				restoreCaretPosition()
			}, 20),

		},
		components: {
			SelectPossibleValues
		},
	}
</script>

<style scoped>
	.val-txt {
		padding: 0px 3px;
		padding-bottom: 3px;
    border-radius: 2px;
	}
	.val-txt:hover {
		background: #eef;
	}
	.val-edit {
		display: inline-block;
		min-width:5px;
		padding: 0px 2px;
		cursor: text;
	}
	.layout-attr {
		display: inline-block;
		color: #eee;
		background: #444;
		margin-left: 5px;
		font-size: 12px;
		line-height: 1.2;
		padding: 3px 6px 2px 8px;
		border-radius: 10px;
	}
	.layout-attr > .value {
		background: #eee;
		color: #444;
		padding: 1px 5px;
		margin-right: 3px;
	}
	.layout-box {
		display: inline-block;
		border: 1px solid #666;
		margin-left: 5px;
		font-size: 12px;
		line-height: 1.2;
		padding: 0px 6px 0px 5px;
	}
	.layout-box > span {
		display: inline-block;
		padding: 3px 0px 2px 0px;
	}
	.layout-box > .title {
		border-right: 1px solid #666;
		padding-right: 5px;
	}
	.layout-box > .value {
		padding-left: 2px;
	}
	.attr-edit {
		cursor: text;
	}
</style>
