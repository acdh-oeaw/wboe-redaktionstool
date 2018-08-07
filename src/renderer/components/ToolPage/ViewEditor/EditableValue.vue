<template>
	<span class="val-obj" v-if="editType === 'selectPossibleValues'">
		<SelectPossibleValues @select="setSelected" :selected="getSelected()" :selectedText="this.content.orgXmlObj.getValue(false)" :values="content.parserObj.options.get('value.is.possibleValues')"/>
	</span>

	<span class="val-obj val-txt" v-else>
		<span class="val-edit val-focus" ref="valEdit" @input="valEditUpdate" @focus="valEditUpdate" @blur="valEditUpdateValue" @keyup.enter="valEditUpdateValue" @keydown.enter.prevent contenteditable>{{ aValue }}</span>
		<font-awesome-icon @click="$refs.valEdit.focus()" icon="edit" class="fa-icon" :title="editType"/>
	</span>
</template>

<script>
	import _ from 'lodash'
	import SelectPossibleValues from './SelectPossibleValues'
	import veFunctions from './functions'

	export default {
		name: 'EditableValue',
		props: {
			content: Object
		},
		data () {
			return {
				'isOpen': true,
			}
		},
		computed: {
			aValue () {
				return this.content.orgXmlObj.getValueByOption(this.content.parserObj.options.get('value'), false)
			},
			editType () {		// Art der Wert bearbeitung
				if (this.content.parserObj.options.get('value.is.possibleValues')) {
					return 'selectPossibleValues'
				}
				return 'text'
			}
		},
		methods: {
			getSelected: function () {
				let sVal = this.content.orgXmlObj.getValue(false)
				let oKey = -1
				this.content.parserObj.options.get('value.is.possibleValues').some(function (aVal, aKey) {
					if ((aVal.title || aVal.value || aVal) === sVal) {
						oKey = aKey
						return true
					}
				}, this)
				return oKey
			},
			setSelected: function (val) {
				if (val >= 0) {
					let aVal = this.content.parserObj.options.get('value.is.possibleValues')[val]
					this.content.orgXmlObj.setValue(aVal.value || aVal)
					if (aVal.attribute && Object.keys(aVal.attribute).length > 0) {
						Object.keys(aVal.attribute).forEach(function (aKey) {
							this.content.orgXmlObj.setAttribute(aKey, aVal.attribute[aKey])
						}, this)
					}
				} else {
					this.content.orgXmlObj.setValue(null)
				}
			},
			valEditUpdate: _.debounce(function (e) {
				var restoreCaretPosition = veFunctions.saveCaretPosition(e.target)
				e.target.innerText = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
				restoreCaretPosition()
			}, 20),
			valEditUpdateValue: function (e) {
				this.content.orgXmlObj.setValue(e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, ''))
			},
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
</style>
