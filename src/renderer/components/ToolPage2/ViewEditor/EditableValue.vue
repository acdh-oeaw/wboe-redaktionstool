<template>
	<span v-if="editType === 'selectPossibleValues'">
		<SelectPossibleValues @select="setSelected" :selected="getSelected()" :selectedText="this.content.orgXmlObj.getValue(false)" :values="content.parserObj.options.get('value.is.possibleValues')"/>
	</span>

	<span v-else><b>Editable Value ({{ editType }}):</b> {{ content.orgXmlObj.getValueByOption(content.parserObj.options.get('value'), false) }}</span>
</template>

<script>
	import SelectPossibleValues from './SelectPossibleValues'
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
				console.log('setSelected', val)
			}
		},
		components: {
			SelectPossibleValues
		},
	}
</script>

<style scoped>
</style>
