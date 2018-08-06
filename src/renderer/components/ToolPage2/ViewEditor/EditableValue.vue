<template>
	<span class="val-obj" v-if="editType === 'selectPossibleValues'">
		<SelectPossibleValues @select="setSelected" :selected="getSelected()" :selectedText="this.content.orgXmlObj.getValue(false)" :values="content.parserObj.options.get('value.is.possibleValues')"/>
	</span>

	<span class="val-obj val-txt" v-else>
		{{ content.orgXmlObj.getValueByOption(content.parserObj.options.get('value'), false) }}
		<font-awesome-icon icon="edit" class="fa-icon" :title="editType"/>
	</span>
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
	.val-txt {
		padding: 0px 3px;
		padding-bottom: 3px;
    border-radius: 2px;
	}
	.val-txt:hover {
		background: #eef;
	}
</style>
