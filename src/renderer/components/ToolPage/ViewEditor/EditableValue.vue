<template>

	<span :class="{ 'val-obj': true, 'bold': content.parserObj.options.get('layout.bold'), 'italic': content.parserObj.options.get('layout.italic'), 'underline': content.parserObj.options.get('layout.underline') }"
				v-if="editType === 'selectPossibleValues'">
		<SelectPossibleValues @select="setSelected" :selected="getSelected()" :selectedText="this.content.orgXmlObj.getValue(false)" :values="content.parserObj.options.get('value.is.possibleValues')" v-if="!refreshSelect"/>
	</span>

	<span :class="{ 'val-obj': true, 'val-txt': true, 'bold': content.parserObj.options.get('layout.bold'), 'italic': content.parserObj.options.get('layout.italic'), 'underline': content.parserObj.options.get('layout.underline') }"
				v-else>
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
				'refreshSelect': false,
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
			setSelected: function (val) {		// Auswahl ändern
				if (val >= 0) {
					let aVal = this.content.parserObj.options.get('value.is.possibleValues')[val]
					this.content.orgXmlObj.setValue(aVal.value || aVal)
					if (aVal.attribute && Object.keys(aVal.attribute).length > 0) {
						Object.keys(aVal.attribute).forEach(function (aKey) {
							this.content.orgXmlObj.setAttribute(aKey, aVal.attribute[aKey])
						}, this)
					}
					this.content.checkParser()
				} else {
					this.content.orgXmlObj.setValue(null)
					this.content.checkParser()
				}
			},
			valEditUpdate: _.debounce(function (e) {		// Bei Textfeldern HTML-Elemente und Zeilenumbrüche entfernen
				var restoreCaretPosition = veFunctions.saveCaretPosition(e.target)
				e.target.innerText = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
				restoreCaretPosition()
			}, 20),
			valEditUpdateValue: function (e) {		// Aktuelle Eingabe setzen
				let nVal = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
				if (nVal !== this.aValue) {
					this.content.orgXmlObj.setValue(nVal)
					this.content.checkParser()
				}
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
